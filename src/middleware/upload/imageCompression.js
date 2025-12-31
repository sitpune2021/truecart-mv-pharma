/**
 * Deprecated legacy helper.
 * Keeping file to avoid breaking old imports.
 * Internally forwards to utils/image.utils implementation.
 */
const {
  processProductImages,
  deleteProductImages,
  sanitizeFileName
} = require('../../utils/image.utils');

module.exports = {
  processProductImages,
  deleteProductImages,
  sanitizeFileName
};
