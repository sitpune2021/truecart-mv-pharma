const { validationResult } = require('express-validator');
const ResponseUtil = require('../../utils/response.util');

/**
 * Validation middleware - Check express-validator results
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value
    }));

    return ResponseUtil.validationError(res, formattedErrors);
  }

  next();
};

module.exports = validate;
