const ActivityLog = require('../models/ActivityLog');

async function logActivity(req, action, description = '') {
  try {
    await ActivityLog.create({
      userId: req.user ? req.user.id : null,
      action,
      description,
      ipAddress: req.ip || (req.socket && req.socket.remoteAddress) || null,
    });
  } catch (err) {
    // logging must never break the request
    // eslint-disable-next-line no-console
    console.error('logActivity error:', err.message);
  }
}

module.exports = { logActivity };
