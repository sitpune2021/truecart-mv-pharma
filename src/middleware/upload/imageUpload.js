const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const UPLOAD_ROOT = path.join(__dirname, '../../../uploads');
const TEMP_DIR = path.join(UPLOAD_ROOT, 'temp');
const USER_DIR = path.join(UPLOAD_ROOT, 'users');
const PRODUCT_DIR = path.join(UPLOAD_ROOT, 'products');
const BRAND_DIR = path.join(UPLOAD_ROOT, 'brands');
const MANUFACTURER_DIR = path.join(UPLOAD_ROOT, 'manufacturers');
const CATEGORY_DIR = path.join(UPLOAD_ROOT, 'categories');

const ensureDirectories = () => {
  [UPLOAD_ROOT, TEMP_DIR, USER_DIR, PRODUCT_DIR, BRAND_DIR, MANUFACTURER_DIR, CATEGORY_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

ensureDirectories();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = TEMP_DIR;

    if (req.baseUrl.includes('users')) {
      uploadPath = USER_DIR;
    } else if (req.baseUrl.includes('products')) {
      uploadPath = TEMP_DIR;
    } else if (req.baseUrl.includes('brands')) {
      uploadPath = BRAND_DIR;
    } else if (req.baseUrl.includes('manufacturers')) {
      uploadPath = MANUFACTURER_DIR;
    } else if (req.baseUrl.includes('categories')) {
      uploadPath = CATEGORY_DIR;
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const randomId = uuidv4().split('-')[0];
    const ext = path.extname(file.originalname).toLowerCase();
    const baseName = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9]/g, '_')
      .substring(0, 30) || 'upload';

    const uniqueName = `${baseName}_${timestamp}_${randomId}${ext}`;
    cb(null, uniqueName);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed'));
  }
};

// Multer configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE_MB || 10) * 1024 * 1024 // Default 10MB
  }
});

module.exports = {
  uploadSingle: upload.single('image'),
  uploadMultiple: upload.array('images', 10),
  uploadFields: upload.fields([
    { name: 'primary_image', maxCount: 1 },
    { name: 'images', maxCount: 10 }
  ]),
  // Convenience aliases for brand/category single image uploads
  uploadBrandImage: upload.single('logo'),
  uploadManufacturerImage: upload.single('brand_logo'),
  uploadCategoryImage: upload.single('image')
};
