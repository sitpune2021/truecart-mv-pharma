const { Op } = require('sequelize');

/**
 * Generate a URL-friendly slug from text
 * @param {string} text - Text to convert to slug
 * @returns {string} - Generated slug
 */
function generateSlug(text) {
  if (!text) return '';
  
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Generate a unique slug by checking against existing slugs in database
 * @param {string} text - Text to convert to slug
 * @param {Object} model - Sequelize model to check against
 * @param {number|null} excludeId - ID to exclude from uniqueness check (for updates)
 * @returns {Promise<string>} - Unique slug
 */
async function generateUniqueSlug(text, model, excludeId = null) {
  const baseSlug = generateSlug(text);
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const where = { slug };
    
    if (excludeId) {
      where.id = { [Op.ne]: excludeId };
    }

    const existing = await model.findOne({ where });
    
    if (!existing) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

/**
 * Generate hierarchical slug for categories
 * @param {string} name - Category name
 * @param {Object|null} parent - Parent category object
 * @returns {string} - Hierarchical slug
 */
function generateCategorySlug(name, parent = null) {
  const nameSlug = generateSlug(name);
  
  if (!parent || !parent.slug) {
    return nameSlug;
  }
  
  return `${parent.slug}-${nameSlug}`;
}

/**
 * Generate product slug from multiple components
 * @param {Object} options - Slug generation options
 * @param {string} options.brandName - Brand name
 * @param {string} options.productName - Generic product name
 * @param {string} options.packSize - Pack size
 * @param {string} options.sku - Product SKU (fallback)
 * @returns {string} - Generated product slug
 */
function generateProductSlug({ brandName, productName, packSize, sku }) {
  const parts = [];
  
  if (brandName) {
    parts.push(generateSlug(brandName));
  }
  
  if (productName) {
    parts.push(generateSlug(productName));
  }
  
  if (packSize) {
    parts.push(generateSlug(packSize));
  }
  
  if (parts.length === 0 && sku) {
    return generateSlug(sku);
  }
  
  return parts.join('-');
}

/**
 * Validate slug format
 * @param {string} slug - Slug to validate
 * @returns {boolean} - True if valid
 */
function isValidSlug(slug) {
  if (!slug || typeof slug !== 'string') return false;
  
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
}

/**
 * Sanitize and validate slug
 * @param {string} slug - Slug to sanitize
 * @returns {string|null} - Sanitized slug or null if invalid
 */
function sanitizeSlug(slug) {
  if (!slug) return null;
  
  const sanitized = generateSlug(slug);
  return isValidSlug(sanitized) ? sanitized : null;
}

module.exports = {
  generateSlug,
  generateUniqueSlug,
  generateCategorySlug,
  generateProductSlug,
  isValidSlug,
  sanitizeSlug
};
