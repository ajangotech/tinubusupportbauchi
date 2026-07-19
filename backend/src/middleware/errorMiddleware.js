const logger = require('../config/logger');

function notFound(req, res) {
  res.status(404).json({ success: false, message: 'Resource not found.', path: req.originalUrl });
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  if (err && err.name === 'MulterError') {
    const message = err.code === 'LIMIT_FILE_SIZE'
      ? 'File too large.'
      : `Upload error: ${err.message}`;
    return res.status(400).json({ success: false, message });
  }

  if (err && err.isJoi) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed.',
      errors: err.details.map((d) => ({ field: d.path.join('.'), message: d.message })),
    });
  }

  const status = err.status || err.statusCode || 500;
  const message = err.expose ? err.message : (status >= 500 ? 'Internal server error.' : err.message);

  if (status >= 500) logger.error('Unhandled error:', err);
  else logger.warn('Client error:', err.message);

  res.status(status).json({ success: false, message });
}

module.exports = { notFound, errorHandler };
