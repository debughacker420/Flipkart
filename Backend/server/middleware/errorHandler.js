const { validationResult } = require('express-validator');

/**
 * Universal Fallback Error Handler Matrix
 * Safely sanitizes errors masking stack traces in production constraints
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[Error] ${err.stack}`);
  }

  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

/**
 * Asynchronous Promise Wrapper logic parsing API route callbacks safely
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Array Validator pipeline executing sequentially and filtering JSON feedback maps
 */
const validate = (validations) => {
  return async (req, res, next) => {
    // Array iteration executing synchronous payload definitions
    for (const validation of validations) {
      const result = await validation.run(req);
      if (result.errors.length) break;
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({
      status: 'fail',
      errors: errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg
      }))
    });
  };
};

module.exports = {
  errorHandler,
  asyncHandler,
  validate
};
