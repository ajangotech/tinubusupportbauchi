/**
 * Validation middleware factory using Joi.
 * Usage: validate(registerSchema, 'body') | validate(schema, 'body', 'query', 'params')
 */
function validate(schema, ...locations) {
  const locs = locations.length ? locations : ['body'];
  return (req, res, next) => {
    const errors = [];
    for (const loc of locs) {
      const source = req[loc] || {};
      const { error, value } = schema.validate(source, {
        abortEarly: false,
        stripUnknown: true,
        allowUnknown: false,
      });
      if (error) {
        for (const detail of error.details) {
          errors.push({ field: detail.path.join('.'), message: detail.message });
        }
      } else {
        req[loc] = value; // replace with sanitized values
      }
    }
    if (errors.length) {
      return res.status(422).json({ success: false, message: 'Validation failed.', errors });
    }
    next();
  };
}

module.exports = validate;
