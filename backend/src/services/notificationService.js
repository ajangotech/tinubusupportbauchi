const { Notification } = require('../models');
const logger = require('../config/logger');

async function createNotification({ userId = null, title, message, type = 'info' }) {
  try {
    return await Notification.create({ userId, title, message, type });
  } catch (err) {
    logger.error('createNotification error:', err.message);
    return null;
  }
}

async function notifyUser(userId, title, message, type = 'info') {
  return createNotification({ userId, title, message, type });
}

async function notifyAdmins(title, message, type = 'info') {
  // Admins receive notifications without a specific user_id (broadcast).
  return createNotification({ userId: null, title, message, type });
}

module.exports = { createNotification, notifyUser, notifyAdmins };
