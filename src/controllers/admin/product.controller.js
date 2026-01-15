const BaseController = require('../../utils/baseController');
const ProductService = require('../../services/admin/product.service');
const path = require('path');
const fs = require('fs').promises;
const {
  processProductImages,
  deleteProductImages
} = require('../../utils/image.utils');

class ProductController extends BaseController {
  constructor() {
    super('ProductController');
  }

  parseJsonField(value, fallback) {
    if (!value) return fallback;
    try {
      return JSON.parse(value);
    } catch (error) {
      return fallback;
    }
  }

  sanitizeBoolean(value, fallback = false) {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      if (value.toLowerCase() === 'true') return true;
      if (value.toLowerCase() === 'false') return false;
    }
    return fallback;
  }

  async buildImagePayload({ req, productData, existingProduct = null }) {
    console.log('buildImagePayload: received productData', {
      primary_image_source: productData.primary_image_source,
      primary_image: productData.primary_image,
      primary_image_client_id: productData.primary_image_client_id,
      retain_images: productData.retain_images
    });

    const sku =
      productData.sku ||
      productData.slug ||
      productData.productName ||
      existingProduct?.sku ||
      'product';
    const processedImages = await processProductImages({
      files: req.files || [],
      sku
    });

    console.log('buildImagePayload: processed new images', processedImages.map(f => f.path));

    if (!existingProduct) {
      // Create product: only new images
      if (processedImages.length) {
        productData.images = processedImages.map((file) => file.path);
        productData.primary_image =
          this.resolvePrimaryImage(productData, processedImages, []);
      }
      return;
    }

    const retainImages = this.parseJsonField(
      productData.retain_images,
      existingProduct.images || []
    );

    console.log('buildImagePayload: retainImages after parsing', retainImages);

    const removedImages = this.parseJsonField(
      productData.removed_images,
      []
    );

    console.log('buildImagePayload: removedImages', removedImages);

    if (removedImages.length) {
      await deleteProductImages(removedImages);
    }

    const finalImages = [
      ...retainImages,
      ...processedImages.map((file) => file.path)
    ];

    // Ensure unique images
    productData.images = [...new Set(finalImages)];
    productData.primary_image = this.resolvePrimaryImage(
      productData,
      processedImages,
      retainImages
    );

    console.log('buildImagePayload: final primary_image', productData.primary_image);
    console.log('buildImagePayload: final images array', productData.images);

    delete productData.retain_images;
    delete productData.removed_images;
  }

  resolvePrimaryImage(productData, processedImages, retainImages = []) {
    const source = productData.primary_image_source;
    if (source === 'existing' && productData.primary_image) {
      if (retainImages.includes(productData.primary_image)) {
        return productData.primary_image;
      }
    }

    if (source === 'new' && productData.primary_image_client_id) {
      const match = processedImages.find(
        (file) => file.clientId === productData.primary_image_client_id
      );
      if (match) {
        return match.path;
      }
    }

    const fallback =
      retainImages[0] || processedImages[0]?.path || productData.images?.[0] || null;
    return fallback;
  }

  /**
   * Get all products
   */
  getAllProducts = this.asyncHandler(async (req, res) => {
    const {
      page,
      limit,
      search,
      category,
      brand,
      isActive,
      isFeatured,
      isBestSeller,
      isOffer,
      sortBy,
      sortOrder
    } = req.query;

    const result = await ProductService.getAllProducts({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      search,
      category,
      brand,
      isActive: isActive !== undefined ? isActive === 'true' : null,
      isFeatured: isFeatured !== undefined ? isFeatured === 'true' : null,
      isBestSeller: isBestSeller !== undefined ? isBestSeller === 'true' : null,
      isOffer: isOffer !== undefined ? isOffer === 'true' : null,
      sortBy,
      sortOrder
    });

    await this.logActivity(req, 'VIEW_PRODUCTS', 'Viewed products list');

    this.sendPaginatedResponse(res, result.data, result.pagination, 'Products retrieved successfully');
  });

  /**
   * Get product by ID
   */
  getProductById = this.asyncHandler(async (req, res) => {
    const { id } = req.params;

    const product = await ProductService.getProductById(id);

    await this.logActivity(req, 'VIEW_PRODUCT', `Viewed product: ${product.name}`);

    this.sendSuccess(res, product, 'Product retrieved successfully');
  });

  /**
   * Create new product
   */
  createProduct = this.asyncHandler(async (req, res) => {
    const productData = { ...req.body };
    const files = req.files || [];

    // Normalize field names from snake_case to match service expectations
    if (productData.product_name) {
      productData.productName = productData.product_name;
      delete productData.product_name;
    }

    // Handle main product images
    const mainProductImages = files.filter(f => f.fieldname === 'images');
    await this.buildImagePayload({ req: { ...req, files: mainProductImages }, productData });

    // Handle variant images (add primary support similar to product)
    if (productData.variants) {
      let variants = JSON.parse(productData.variants);

      for (let i = 0; i < variants.length; i++) {
        const variant = variants[i];
        const variantImageFiles = files.filter(f => f.fieldname === `variants[${i}][images]`);

        if (variantImageFiles.length > 0) {
          const processedVariantImages = await processProductImages({
            files: variantImageFiles,
            sku: productData.sku || productData.slug || productData.productName || 'product',
            subfolder: `variant-${i + 1}`
          });
          variant.images = processedVariantImages.map(img => img.path);

          // Allow client to pick primary variant image via primary_image_client_id or fallback to first
          const clientPrimaryId = variant.primary_image_client_id;
          if (clientPrimaryId) {
            const match = processedVariantImages.find(f => f.clientId === clientPrimaryId);
            variant.primary_image = match ? match.path : processedVariantImages[0]?.path || null;
          } else {
            variant.primary_image = processedVariantImages[0]?.path || null;
          }
        }
      }
      productData.variants = JSON.stringify(variants);
    }

    const product = await ProductService.createProduct(productData, req.user.id);

    await this.logActivity(req, 'CREATE_PRODUCT', `Created product: ${product.name}`, 'SUCCESS');

    this.sendSuccess(res, product, 'Product created successfully', 201);
  });

  /**
   * Update product
   */
  updateProduct = this.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const productData = { ...req.body };

    // Get existing product first
    const existingProduct = await ProductService.getProductById(id);

    const files = req.files || [];
    const mainProductImages = files.filter(f => f.fieldname === 'images');

    await this.buildImagePayload({ 
      req: { ...req, files: mainProductImages }, 
      productData, 
      existingProduct 
    });

    // Handle variant images on update: add/replace + primary selection
    if (productData.variants) {
      let variants = JSON.parse(productData.variants);
      const files = req.files || [];

      console.log('updateProduct: processing variants for images');

      for (let i = 0; i < variants.length; i++) {
        const variant = variants[i];
        const existingVariant =
          existingProduct.variants?.find(v => `${v.id}` === `${variant.id}`) || null;
        const existingImages = existingVariant?.images || [];
        
        const retainImages = this.parseJsonField(
          variant.retain_images,
          existingImages
        );
        
        const removedImages = this.parseJsonField(variant.removed_images, []);

        console.log(`Variant ${i} [ID: ${variant.id}]:`, {
          retainImages,
          removedImages,
          primary_image_source: variant.primary_image_source,
          primary_image: variant.primary_image,
          primary_image_client_id: variant.primary_image_client_id
        });

        // Delete removed images from storage
        if (removedImages.length) {
          await deleteProductImages(removedImages);
        }

        const variantImageFiles = files.filter(f => f.fieldname === `variants[${i}][images]`);

        const processedVariantImages = variantImageFiles.length
          ? await processProductImages({
              files: variantImageFiles,
              sku: productData.sku || productData.slug || productData.productName || existingProduct.sku || 'product',
              subfolder: `variant-${i + 1}`
            })
          : [];

        const finalImages = [
          ...retainImages,
          ...processedVariantImages.map(img => img.path)
        ];
        
        // Remove duplicates if any
        variant.images = [...new Set(finalImages)];

        // Primary resolution for variant (supports existing/new)
        const source = variant.primary_image_source;
        const clientPrimaryId = variant.primary_image_client_id;

        if (source === 'existing' && variant.primary_image && variant.images.includes(variant.primary_image)) {
          variant.primary_image = variant.primary_image;
        } else if (source === 'new' && clientPrimaryId) {
          const match = processedVariantImages.find(f => f.clientId === clientPrimaryId);
          variant.primary_image = match ? match.path : variant.images[0] || null;
        } else {
          variant.primary_image = variant.images[0] || null;
        }

        console.log(`Variant ${i} final primary_image:`, variant.primary_image);
        console.log(`Variant ${i} final images array:`, variant.images);

        // Cleanup helper fields
        delete variant.retain_images;
        delete variant.removed_images;
      }
      productData.variants = JSON.stringify(variants);
    }

    const product = await ProductService.updateProduct(id, productData, req.user.id);

    await this.logActivity(req, 'UPDATE_PRODUCT', `Updated product: ${product.name}`, 'SUCCESS');

    this.sendSuccess(res, product, 'Product updated successfully');
  });

  /**
   * Delete product
   */
  deleteProduct = this.asyncHandler(async (req, res) => {
    const { id } = req.params;

    await ProductService.deleteProduct(id, req.user.id);

    await this.logActivity(req, 'DELETE_PRODUCT', `Deleted product ID: ${id}`, 'SUCCESS');

    this.sendSuccess(res, null, 'Product deleted successfully');
  });

  /**
   * Update product stock
   */
  updateStock = this.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;

    const product = await ProductService.updateStock(id, quantity, req.user.id);

    await this.logActivity(req, 'UPDATE_STOCK', `Updated stock for product: ${product.name}`, 'SUCCESS');

    this.sendSuccess(res, product, 'Stock updated successfully');
  });

  /**
   * Delete product image
   */
  deleteProductImage = this.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { imagePath } = req.body;

    const product = await ProductService.getProductById(id);

    // Remove image from array
    const updatedImages = product.images.filter(img => img !== imagePath);
    
    // Update primary image if deleted
    let updatedPrimaryImage = product.primary_image;
    if (product.primary_image === imagePath) {
      updatedPrimaryImage = updatedImages[0] || null;
    }

    await ProductService.updateProduct(id, {
      images: updatedImages,
      primary_image: updatedPrimaryImage
    }, req.user.id);

    await deleteProductImages([imagePath]);

    await this.logActivity(req, 'DELETE_PRODUCT_IMAGE', `Deleted image from product: ${product.name}`, 'SUCCESS');

    this.sendSuccess(res, null, 'Image deleted successfully');
  });

  /**
   * Get product statistics
   */
  getProductStats = this.asyncHandler(async (req, res) => {
    const stats = await ProductService.getProductStats();

    await this.logActivity(req, 'VIEW_PRODUCT_STATS', 'Viewed product statistics');

    this.sendSuccess(res, stats, 'Product statistics retrieved successfully');
  });

  /**
   * Get categories
   */
  getCategories = this.asyncHandler(async (req, res) => {
    const categories = await ProductService.getCategories();

    this.sendSuccess(res, categories, 'Categories retrieved successfully');
  });

  /**
   * Get brands
   */
  getBrands = this.asyncHandler(async (req, res) => {
    const brands = await ProductService.getBrands();

    this.sendSuccess(res, brands, 'Brands retrieved successfully');
  });
}

module.exports = new ProductController();
