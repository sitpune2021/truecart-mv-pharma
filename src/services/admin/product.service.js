const BaseService = require('../../utils/baseService');
const { Product, User, ProductVariant, Brand, Manufacturer, sequelize } = require('../../database/models');
const { NotFoundError, ConflictError } = require('../../utils/errors');
const { Op } = require('sequelize');
const { generateUniqueSlug } = require('../../utils/slug.utils');

class ProductService extends BaseService {
  constructor() {
    super(Product, 'Product');
  }

  /**
   * Get all products with filters
   */
  async getAllProducts(options = {}) {
    const {
      page = 1,
      limit = 10,
      search = '',
      category = null,
      brand = null,
      isActive = null,
      isFeatured = null,
      isBestSeller = null,
      isOffer = null,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = options;

    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { sku: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (category) {
      where.category = category;
    }

    if (brand) {
      where.brand = brand;
    }

    if (isActive !== null) {
      where.is_active = isActive;
    }

    if (isFeatured !== null) {
      where.is_featured = isFeatured;
    }

    if (isBestSeller !== null) {
      where.is_best_seller = isBestSeller;
    }

    if (isOffer !== null) {
      where.is_offer = isOffer;
    }

    const result = await this.findAll({
      page,
      limit,
      where,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'full_name', 'email']
        },
        {
          model: User,
          as: 'updater',
          attributes: ['id', 'full_name', 'email']
        }
      ],
      order: [[sortBy, sortOrder]]
    });

    return result;
  }

  /**
   * Get product by ID
   */
  async getProductById(id, options = {}) {
    const { transaction } = options;
    const product = await Product.findByPk(id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'full_name', 'email'] },
        { model: User, as: 'updater', attributes: ['id', 'full_name', 'email'] },
        { association: 'salts' },
        { model: ProductVariant, as: 'variants' },
        { model: Brand, as: 'brandDetails' },
        { model: Manufacturer, as: 'manufacturerDetails' },
        { association: 'categoryLevel1Details' },
        { association: 'categoryLevel2Details' },
        { association: 'categoryLevel3Details' },
        { association: 'productName' }
      ],
      transaction
    });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    const p = product.toJSON();

    // Return snake_case fields as-is, add salt array for form
    const result = {
      ...p,
      salt: Array.isArray(p.salts) ? p.salts.map((s) => s.id) : [],
    };

    return result;
  }

  /**
   * Create new product
   */
  async createProduct(data, createdBy) {
    const { variants, salt_ids, ...productData } = data;
    const parsedVariants = variants ? JSON.parse(variants) : null;

    // Ensure IDs are integers
    if (productData.category_level_1_id) productData.category_level_1_id = parseInt(productData.category_level_1_id, 10);
    if (productData.category_level_2_id) productData.category_level_2_id = parseInt(productData.category_level_2_id, 10);
    if (productData.category_level_3_id) productData.category_level_3_id = parseInt(productData.category_level_3_id, 10);
    if (productData.dosage_id) productData.dosage_id = parseInt(productData.dosage_id, 10);
    if (productData.gst_rate_id) productData.gst_rate_id = parseInt(productData.gst_rate_id, 10);
    if (productData.manufacturer_id) productData.manufacturer_id = parseInt(productData.manufacturer_id, 10);
    if (productData.brand_id) productData.brand_id = parseInt(productData.brand_id, 10);

    console.info('createProduct: incoming', {
      productData,
      variantsCount: Array.isArray(parsedVariants) ? parsedVariants.length : 0,
      createdBy
    });

    // Derive product price from first variant if missing
    if (productData.price === undefined || productData.price === null) {
      const firstVariant = Array.isArray(parsedVariants) && parsedVariants.length > 0 ? parsedVariants[0] : null;
      const derivedPrice = firstVariant?.mrp ?? 0;
      productData.price = derivedPrice;
    }

    return sequelize.transaction(async (transaction) => {
      // Generate unique SKU if not provided
      if (!productData.sku) {
        productData.sku = `SKU-${Date.now()}`;
      }
      console.info('createProduct: resolved SKU', productData.sku);

      // Check SKU uniqueness
      const existing = await Product.findOne({ where: { sku: productData.sku } });
      if (existing) {
        throw new ConflictError('Product with this SKU already exists');
      }

      // Generate unique product slug
      const productSlug = await generateUniqueSlug(productData.productName, Product, null, transaction);
      console.info('createProduct: resolved product slug', productSlug);

      // Parse salt_ids from JSON array string and ensure integers
      let saltIdsNormalized = [];
      if (salt_ids) {
        if (typeof salt_ids === 'string') {
          try {
            const parsed = JSON.parse(salt_ids);
            saltIdsNormalized = Array.isArray(parsed) ? parsed.map(id => parseInt(id, 10)) : [];
          } catch (e) {
            saltIdsNormalized = salt_ids.split(',').map(s => parseInt(s.trim(), 10)).filter(id => !isNaN(id));
          }
        } else if (Array.isArray(salt_ids)) {
          saltIdsNormalized = salt_ids.map(id => parseInt(id, 10)).filter(id => !isNaN(id));
        }
      }

      // Create product
      const product = await Product.create({
        name: productData.productName,
        slug: productSlug,
        sku: productData.sku,
        brand_id: productData.brand_id || null,
        manufacturer_id: productData.manufacturer_id || null,
        category_level_1_id: productData.category_level_1_id,
        category_level_2_id: productData.category_level_2_id || null,
        category_level_3_id: productData.category_level_3_id || null,
        dosage_id: productData.dosage_id,
        gst_rate_id: productData.gst_rate_id,
        requires_prescription: productData.requires_prescription === 'true' || productData.requires_prescription === true,
        short_description: productData.short_description,
        full_description: productData.full_description,
        discount_type: productData.discount_type,
        discount_value: productData.discount_value ? parseFloat(productData.discount_value) : 0,
        is_active: productData.is_active === 'true' || productData.is_active === true,
        is_featured: productData.is_featured === 'true' || productData.is_featured === true,
        is_best_seller: productData.is_best_seller === 'true' || productData.is_best_seller === true,
        is_offer: productData.is_offer === 'true' || productData.is_offer === true,
        status: productData.status || 'draft',
        price: productData.price || 0,
        primary_image: productData.primary_image || null,
        images: productData.images || [],
        created_by: createdBy
      }, { transaction });
      console.info('createProduct: product row inserted', { id: product.id, sku: product.sku, slug: product.slug });

      // Link salts
      if (saltIdsNormalized && saltIdsNormalized.length > 0) {
        await product.addSalts(saltIdsNormalized, { transaction });
        console.info('createProduct: salts linked', saltIdsNormalized);
      }

      // Create variants
      if (parsedVariants && Array.isArray(parsedVariants)) {
        for (let index = 0; index < parsedVariants.length; index++) {
          const variantData = parsedVariants[index];
          const { id: clientVariantId, ...restVariant } = variantData;

          // Ensure attribute and unit IDs are integers
          if (restVariant.attribute1_name) {
            restVariant.attribute1_name = parseInt(restVariant.attribute1_name, 10);
          }
          if (restVariant.attribute2_name) {
            restVariant.attribute2_name = parseInt(restVariant.attribute2_name, 10);
          }
          if (restVariant.unit_type) {
            restVariant.unit_type_id = parseInt(restVariant.unit_type, 10);
          }

          // Ensure numeric fields are proper types
          if (restVariant.mrp) restVariant.mrp = parseFloat(restVariant.mrp);
          if (restVariant.cost_price) restVariant.cost_price = parseFloat(restVariant.cost_price);
          if (restVariant.stock_quantity) restVariant.stock_quantity = parseInt(restVariant.stock_quantity, 10);
          if (restVariant.min_order_quantity) restVariant.min_order_quantity = parseInt(restVariant.min_order_quantity, 10);
          if (restVariant.max_order_quantity) restVariant.max_order_quantity = parseInt(restVariant.max_order_quantity, 10);

          // Only first variant is default
          restVariant.is_default = index === 0;

          const variantName = restVariant.variant_name || restVariant.display_name || 'variant';
          const variantSkuSuffixBase = `v${String(index + 1).padStart(2, '0')}`;
          const variantRandom = Math.random().toString(36).slice(-4);
          const variantSkuSuffix = `${variantSkuSuffixBase}-${variantRandom}`;
          const variantSlugBase = `${productSlug}-${variantSkuSuffix}-${variantName}`;
          const variantSlug = await generateUniqueSlug(variantSlugBase, ProductVariant, null, transaction);

          console.info('createProduct: variant prepared', {
            index,
            clientVariantId,
            variantSkuSuffix,
            variantSlug
          });

          try {
            await ProductVariant.create({
              variant_name: variantName,
              display_name: restVariant.display_name || variantName,
              product_id: product.id,
              slug: variantSlug,
              sku: `${productData.sku}-${variantSkuSuffix}`.slice(0, 100),
              attribute1_name: restVariant.attribute1_name || null,
              attribute1_value: restVariant.attribute1_value || null,
              attribute2_name: restVariant.attribute2_name || null,
              attribute2_value: restVariant.attribute2_value || null,
              unit_value: restVariant.unit_value || null,
              unit_type_id: restVariant.unit_type_id || null,
              selling_price: restVariant.selling_price || 0,
              mrp: restVariant.mrp || 0,
              cost_price: restVariant.cost_price || 0,
              stock_quantity: restVariant.stock_quantity || 0,
              min_order_quantity: restVariant.min_order_quantity || 1,
              max_order_quantity: restVariant.max_order_quantity || 10,
              images: restVariant.images || [],
              primary_image: restVariant.primary_image || null,
              is_default: restVariant.is_default,
              created_by: createdBy
            }, { transaction });
            console.info('createProduct: variant inserted', {
              index,
              product_id: product.id,
              sku: `${productData.sku}-${variantSkuSuffix}`,
              slug: variantSlug
            });
          } catch (err) {
            console.error('createProduct: variant insert failed', {
              index,
              errorName: err?.name,
              errorMessage: err?.message,
              errors: err?.errors || null
            });
            throw err;
          }
        }
      }

      console.info('createProduct: created product id', product.id);
      return this.getProductById(product.id, { transaction });
    });
  }

  /**
   * Update product
   */
  async updateProduct(id, data, updatedBy) {
    console.log('updateProduct: received data', {
      id,
      category_level_1_id: data.category_level_1_id,
      category_level_2_id: data.category_level_2_id,
      category_level_3_id: data.category_level_3_id,
      dosage_id: data.dosage_id,
      gst_rate_id: data.gst_rate_id,
      discount_value: data.discount_value,
      discount_type: data.discount_type
    });

    const product = await Product.findByPk(id, {
      include: [
        { model: ProductVariant, as: 'variants' },
        { association: 'salts' }
      ]
    });
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    return sequelize.transaction(async (transaction) => {
      // If we are updating variants, clear is_default to NULL for all variants first.
      // This avoids the UNIQUE(product_id, is_default) constraint when toggling defaults.
      let parsedVariants = null;
      if (data.variants) {
        parsedVariants = JSON.parse(data.variants);
        await ProductVariant.update(
          { is_default: null },
          { where: { product_id: id }, transaction }
        );
      }

      // Check SKU uniqueness if changed
      if (data.sku && data.sku !== product.sku) {
        const existing = await Product.findOne({ where: { sku: data.sku } });
        if (existing) {
          throw new ConflictError('SKU already in use');
        }
      }

      // Normalize numeric/boolean fields
      const normalizedProduct = {
        name: data.product_name || data.name,
        slug: data.slug,
        sku: data.sku,
        short_description: data.short_description,
        full_description: data.full_description,
        category_level_1_id: data.category_level_1_id ? parseInt(data.category_level_1_id, 10) : null,
        category_level_2_id: data.category_level_2_id ? parseInt(data.category_level_2_id, 10) : null,
        category_level_3_id: data.category_level_3_id ? parseInt(data.category_level_3_id, 10) : null,
        dosage_id: data.dosage_id ? parseInt(data.dosage_id, 10) : null,
        gst_rate_id: data.gst_rate_id ? parseInt(data.gst_rate_id, 10) : null,
        manufacturer_id: data.manufacturer_id ? parseInt(data.manufacturer_id, 10) : null,
        is_active: data.is_active === 'true' || data.is_active === true,
        is_featured: data.is_featured === 'true' || data.is_featured === true,
        is_best_seller: data.is_best_seller === 'true' || data.is_best_seller === true,
        is_offer: data.is_offer === 'true' || data.is_offer === true,
        requires_prescription: data.requires_prescription === 'true' || data.requires_prescription === true,
        discount_type: data.discount_type,
        discount_value: data.discount_value ? parseFloat(data.discount_value) : 0,
        status: data.status,
        images: data.images,
        primary_image: data.primary_image,
        updated_by: updatedBy
      };

      console.log('updateProduct: normalized product data', {
        category_level_1_id: normalizedProduct.category_level_1_id,
        category_level_2_id: normalizedProduct.category_level_2_id,
        category_level_3_id: normalizedProduct.category_level_3_id,
        dosage_id: normalizedProduct.dosage_id,
        gst_rate_id: normalizedProduct.gst_rate_id,
        discount_value: normalizedProduct.discount_value,
        discount_type: normalizedProduct.discount_type
      });

      // Handle salt updates if provided in payload
      if (data.salt_ids) {
        let saltIdsNormalized = [];
        try {
          const parsed = JSON.parse(data.salt_ids);
          saltIdsNormalized = Array.isArray(parsed) ? parsed.map(sid => parseInt(sid, 10)) : [];
        } catch (e) {
          saltIdsNormalized = data.salt_ids.split(',').map(s => parseInt(s.trim(), 10)).filter(sid => !isNaN(sid));
        }
        if (saltIdsNormalized.length > 0) {
          await product.setSalts(saltIdsNormalized, { transaction });
        } else {
          await product.setSalts([], { transaction });
        }
      }

      await product.update(normalizedProduct, { transaction });
      console.log('updateProduct: product updated successfully');

      // Handle variants if provided
      if (parsedVariants) {
        const variantIdsInPayload = parsedVariants
          .map(v => v.id)
          .filter(id => id && typeof id === 'number');

        console.log('updateProduct: variant IDs in payload', variantIdsInPayload);

        // Delete variants not in payload
        await ProductVariant.destroy({
          where: {
            product_id: id,
            id: { [Op.notIn]: variantIdsInPayload.length > 0 ? variantIdsInPayload : [0] }
          },
          transaction
        });

        for (let index = 0; index < parsedVariants.length; index++) {
          const variantData = parsedVariants[index];
          const isDefault = index === 0; // only first variant is default
          const variantId = variantData.id;

          // Normalize fields
          const normalizedVariant = {
            display_name: variantData.display_name || variantData.variant_name || null,
            variant_name: variantData.variant_name || variantData.display_name || 'variant',
            attribute1_name: variantData.attribute1_name ? parseInt(variantData.attribute1_name, 10) : null,
            attribute1_value: variantData.attribute1_value || null,
            attribute2_name: variantData.attribute2_name ? parseInt(variantData.attribute2_name, 10) : null,
            attribute2_value: variantData.attribute2_value || null,
            unit_value: variantData.unit_value || null,
            unit_type_id: variantData.unit_type ? parseInt(variantData.unit_type, 10) : null,
            mrp: variantData.mrp ? parseFloat(variantData.mrp) : 0,
            cost_price: variantData.cost_price ? parseFloat(variantData.cost_price) : 0,
            selling_price: variantData.selling_price ? parseFloat(variantData.selling_price) : 0,
            stock_quantity: variantData.stock_quantity ? parseInt(variantData.stock_quantity, 10) : 0,
            min_order_quantity: variantData.min_order_quantity ? parseInt(variantData.min_order_quantity, 10) : 1,
            max_order_quantity: variantData.max_order_quantity ? parseInt(variantData.max_order_quantity, 10) : 10,
            images: Array.isArray(variantData.images) ? variantData.images : [],
            primary_image: variantData.primary_image || null,
            is_default: isDefault,
            updated_by: updatedBy
          };

          if (variantId && typeof variantId === 'number') {
            // Update existing variant
            const existingVariant = await ProductVariant.findByPk(variantId, { transaction });
            if (existingVariant) {
              console.log(`updateProduct: updating variant ${variantId}`, {
                primary_image: normalizedVariant.primary_image,
                images_count: normalizedVariant.images.length
              });
              await existingVariant.update(normalizedVariant, { transaction });
            }
          } else {
            // Create new variant if no id or temp string id
            const variantSkuSuffixBase = `v${String(index + 1).padStart(2, '0')}`;
            const variantRandom = Math.random().toString(36).slice(-4);
            const variantSkuSuffix = `${variantSkuSuffixBase}-${variantRandom}`;
            const variantSlugBase = `${product.slug}-${variantSkuSuffix}-${normalizedVariant.variant_name}`;
            const variantSlug = await generateUniqueSlug(variantSlugBase, ProductVariant, null, transaction);

            await ProductVariant.create({
              ...normalizedVariant,
              product_id: product.id,
              slug: variantSlug,
              sku: `${product.sku}-${variantSkuSuffix}`.slice(0, 100),
              created_by: updatedBy
            }, { transaction });
          }
        }
      }

      return this.getProductById(id, { transaction });
    });
  }

  /**
   * Delete product (soft delete)
   */
  async deleteProduct(id, deletedBy) {
    const product = await Product.findByPk(id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    await product.update({ deleted_by: deletedBy });
    await product.destroy();

    return true;
  }

  /**
   * Update product stock
   */
  async updateStock(id, quantity, updatedBy) {
    const product = await Product.findByPk(id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    await product.update({
      stock_quantity: quantity,
      updated_by: updatedBy
    });

    return this.getProductById(id);
  }

  /**
   * Get product statistics
   */
  async getProductStats() {
    const [total, active, featured, bestSeller, offer, lowStock, outOfStock] = await Promise.all([
      Product.count(),
      Product.count({ where: { is_active: true } }),
      Product.count({ where: { is_featured: true } }),
      Product.count({ where: { is_best_seller: true } }),
      Product.count({ where: { is_offer: true } }),
      Product.count({
        where: {
          stock_quantity: {
            [Op.lte]: Product.sequelize.col('low_stock_threshold'),
            [Op.gt]: 0
          }
        }
      }),
      Product.count({ where: { stock_quantity: 0 } })
    ]);

    return {
      total,
      active,
      featured,
      bestSeller,
      offer,
      lowStock,
      outOfStock
    };
  }

  /**
   * Get categories
   */
  async getCategories() {
    const categories = await Product.findAll({
      attributes: [[Product.sequelize.fn('DISTINCT', Product.sequelize.col('category')), 'category']],
      where: {
        category: { [Op.ne]: null }
      },
      raw: true
    });

    return categories.map(c => c.category).filter(Boolean);
  }

  /**
   * Get brands
   */
  async getBrands() {
    const brands = await Product.findAll({
      attributes: [[Product.sequelize.fn('DISTINCT', Product.sequelize.col('brand')), 'brand']],
      where: {
        brand: { [Op.ne]: null }
      },
      raw: true
    });

    return brands.map(b => b.brand).filter(Boolean);
  }
}

module.exports = new ProductService();
