const path = require('path');
const fs = require('fs');
const fsp = fs.promises;
const sharp = require('sharp');

const UPLOAD_ROOT = path.join(__dirname, '../../uploads');
const PRODUCT_UPLOAD_ROOT = path.join(UPLOAD_ROOT, 'products');

const ensureDirectory = async (dirPath) => {
  await fsp.mkdir(dirPath, { recursive: true });
};

const sanitizeFileName = (value = '') => {
  return (value || 'image')
    .toString()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase() || 'image';
};

const resolveUploadPath = (relativePath = '') => {
  const safePath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
  return path.join(UPLOAD_ROOT, safePath);
};

const processProductImages = async ({ files = [], sku = 'product', subfolder = '' }) => {
  const safeSku = sanitizeFileName(sku) || 'product';
  const safeSubfolder = subfolder ? sanitizeFileName(subfolder) : '';
  const destinationDir = safeSubfolder
    ? path.join(PRODUCT_UPLOAD_ROOT, safeSku, safeSubfolder)
    : path.join(PRODUCT_UPLOAD_ROOT, safeSku);
  await ensureDirectory(destinationDir);

  const processedImages = [];

  for (const file of files) {
    const originalName = file.originalname || `image-${Date.now()}`;
    const [maybeClientId, ...rest] = originalName.includes('___')
      ? originalName.split('___')
      : [null, originalName];
    const clientId = maybeClientId;
    const cleanedOriginal = rest.length ? rest.join('___') : originalName;
    const baseName = sanitizeFileName(cleanedOriginal.replace(path.extname(cleanedOriginal), ''));
    const finalFileName = `${baseName || 'image'}-${Date.now()}-${Math.round(Math.random() * 1e6)}.jpg`;
    const destinationPath = path.join(destinationDir, finalFileName);

    try {
      await sharp(file.path)
        .rotate()
        .resize({ width: 1600, withoutEnlargement: true, fit: 'inside' })
        .jpeg({ quality: 80, chromaSubsampling: '4:4:4' })
        .toFile(destinationPath);
    } catch (error) {
      console.error('Failed to process image', error.message);
      continue;
    } finally {
      await fsp.unlink(file.path).catch(() => {});
    }

    const relativePath = safeSubfolder
      ? `/uploads/products/${safeSku}/${safeSubfolder}/${finalFileName}`
      : `/uploads/products/${safeSku}/${finalFileName}`;

    processedImages.push({
      path: relativePath,
      clientId,
      filename: finalFileName,
    });
  }

  return processedImages;
};

const deleteProductImages = async (imagePaths = []) => {
  const deletions = imagePaths
    .filter(Boolean)
    .map(async (imagePath) => {
      const resolvedPath = resolveUploadPath(imagePath);
      if (!resolvedPath.startsWith(UPLOAD_ROOT)) {
        return;
      }
      await fsp.unlink(resolvedPath).catch(() => {});
    });

  await Promise.all(deletions);
};

/**
 * Process a single image (e.g., brand/category) and store under uploads/<folder>
 */
const processSingleImage = async ({ file, folder = 'general', baseName = 'image' }) => {
  if (!file) return null;

  const safeBase = sanitizeFileName(baseName) || 'image';
  const destinationDir = path.join(UPLOAD_ROOT, folder);
  await ensureDirectory(destinationDir);

  const finalFileName = `${safeBase}-${Date.now()}-${Math.round(Math.random() * 1e6)}.jpg`;
  const destinationPath = path.join(destinationDir, finalFileName);

  try {
    await sharp(file.path)
      .rotate()
      .resize({ width: 1600, withoutEnlargement: true, fit: 'inside' })
      .jpeg({ quality: 80, chromaSubsampling: '4:4:4' })
      .toFile(destinationPath);
  } finally {
    await fsp.unlink(file.path).catch(() => {});
  }

  return `/uploads/${folder}/${finalFileName}`;
};

/**
 * Delete arbitrary file paths under uploads/
 */
const deleteFiles = async (paths = []) => {
  const deletions = (paths || [])
    .filter(Boolean)
    .map(async (p) => {
      const resolvedPath = resolveUploadPath(p);
      if (!resolvedPath.startsWith(UPLOAD_ROOT)) return;
      await fsp.unlink(resolvedPath).catch(() => {});
    });
  await Promise.all(deletions);
};

module.exports = {
  processProductImages,
  deleteProductImages,
  sanitizeFileName,
  processSingleImage,
  deleteFiles,
};
