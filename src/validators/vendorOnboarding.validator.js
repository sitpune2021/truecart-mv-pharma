const { body, param } = require('express-validator');

const vendorOnboardingValidators = {
  // Create vendor onboarding
  create: [
    body('user_id')
      .notEmpty()
      .withMessage('User ID is required')
      .isInt({ min: 1 })
      .withMessage('User ID must be a positive integer'),
    body('business_name')
      .notEmpty()
      .withMessage('Business name is required')
      .isLength({ min: 2, max: 255 })
      .withMessage('Business name must be between 2 and 255 characters'),
    body('business_type')
      .optional()
      .isString()
      .withMessage('Business type must be a string'),
    // Relaxed: do not enforce GST/PAN format; accept as provided
    body('gst_number')
      .optional()
      .isString()
      .withMessage('GST number must be a string'),
    body('pan_number')
      .optional()
      .isString()
      .withMessage('PAN number must be a string'),
    body('drug_license_number')
      .optional()
      .isString()
      .withMessage('Drug license number must be a string'),
    body('business_email')
      .optional()
      .isEmail()
      .withMessage('Invalid email format'),
    body('business_phone')
      .optional()
      .isMobilePhone('en-IN')
      .withMessage('Invalid phone number'),
    body('alternate_phone')
      .optional()
      .isMobilePhone('en-IN')
      .withMessage('Invalid alternate phone number'),
    body('address_line1')
      .optional()
      .isString()
      .withMessage('Address line 1 must be a string'),
    body('address_line2')
      .optional()
      .isString()
      .withMessage('Address line 2 must be a string'),
    body('city')
      .optional()
      .isString()
      .withMessage('City must be a string'),
    body('state')
      .optional()
      .isString()
      .withMessage('State must be a string'),
    body('pincode')
      .optional()
      .isPostalCode('IN')
      .withMessage('Invalid pincode'),
    body('country')
      .optional()
      .isString()
      .withMessage('Country must be a string'),
    body('bank_name')
      .optional()
      .isString()
      .withMessage('Bank name must be a string'),
    body('account_number')
      .optional()
      .isString()
      .withMessage('Account number must be a string'),
    body('ifsc_code')
      .optional()
      .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/)
      .withMessage('Invalid IFSC code format'),
    body('account_holder_name')
      .optional()
      .isString()
      .withMessage('Account holder name must be a string'),
    // Relaxed: no numeric/url enforcement
    body('years_in_business')
      .optional(),
    body('website_url')
      .optional(),
    body('description')
      .optional()
      .isString()
      .withMessage('Description must be a string')
  ],

  // Update vendor onboarding
  update: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID must be a positive integer'),
    body('business_name')
      .optional()
      .isLength({ min: 2, max: 255 })
      .withMessage('Business name must be between 2 and 255 characters'),
    body('business_type')
      .optional()
      .isString()
      .withMessage('Business type must be a string'),
    // Relaxed: accept GST/PAN as provided (string)
    body('gst_number')
      .optional()
      .isString()
      .withMessage('GST number must be a string'),
    body('pan_number')
      .optional()
      .isString()
      .withMessage('PAN number must be a string'),
    body('business_email')
      .optional()
      .isEmail()
      .withMessage('Invalid email format'),
    body('business_phone')
      .optional()
      .isMobilePhone('en-IN')
      .withMessage('Invalid phone number'),
    body('years_in_business')
      .optional(),
    body('website_url')
      .optional()
  ],

  // Approve/Reject onboarding
  approveReject: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID must be a positive integer'),
    body('remarks')
      .optional()
      .isString()
      .withMessage('Remarks must be a string')
  ]
};

module.exports = vendorOnboardingValidators;
