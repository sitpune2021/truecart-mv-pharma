const express = require('express');
const router = express.Router();

// Middleware
const { authenticate } = require('../../middleware/auth/authenticate');
const { authorize } = require('../../middleware/auth/authorize');
const validate = require('../../middleware/validation/validate');
const { uploadArray, uploadMultiple } = require('../../middleware/upload/imageUpload');

// Controllers
const VendorOnboardingController = require('../../controllers/admin/vendorOnboarding.controller');

// Validators
const vendorOnboardingValidators = require('../../validators/vendorOnboarding.validator');
const { commonValidators } = require('../../validators/admin.validator');

// Apply authentication to all routes
router.use(authenticate);

// ==================== VENDOR ONBOARDING ROUTES ====================

// Get onboarding statistics
router.get('/stats',
  authorize('vendor_onboarding:read'),
  VendorOnboardingController.getOnboardingStats
);

// Get all onboarding records
router.get('/',
  authorize('vendor_onboarding:read'),
  commonValidators.pagination,
  validate,
  VendorOnboardingController.getAllOnboardings
);

// Get onboarding by user ID
router.get('/user/:userId',
  authorize('vendor_onboarding:read'),
  commonValidators.idParam,
  validate,
  VendorOnboardingController.getOnboardingByUserId
);

// Get onboarding by ID
router.get('/:id',
  authorize('vendor_onboarding:read'),
  commonValidators.idParam,
  validate,
  VendorOnboardingController.getOnboardingById
);

// Create vendor onboarding
router.post('/',
  authorize('vendor_onboarding:create'),
  uploadArray('documents', 10), // Allow up to 10 documents (images or PDFs)
  vendorOnboardingValidators.create,
  validate,
  VendorOnboardingController.createOnboarding
);

// Update vendor onboarding
router.put('/:id',
  authorize('vendor_onboarding:update'),
  uploadArray('documents', 10),
  vendorOnboardingValidators.update,
  validate,
  VendorOnboardingController.updateOnboarding
);

// Approve onboarding
router.post('/:id/approve',
  authorize('vendor_onboarding:approve'),
  vendorOnboardingValidators.approveReject,
  validate,
  VendorOnboardingController.approveOnboarding
);

// Reject onboarding
router.post('/:id/reject',
  authorize('vendor_onboarding:approve'),
  vendorOnboardingValidators.approveReject,
  validate,
  VendorOnboardingController.rejectOnboarding
);

// Delete onboarding
router.delete('/:id',
  authorize('vendor_onboarding:delete'),
  commonValidators.idParam,
  validate,
  VendorOnboardingController.deleteOnboarding
);

module.exports = router;
