const { ContactMessage } = require('../models');
const emailService = require('../services/emailService');
const { logActivity } = require('../middleware/activityLogMiddleware');

async function create(req, res, next) {
  try {
    const message = await ContactMessage.create(req.body);
    await emailService.sendContactAcknowledgement({ to: message.email, name: message.name });
    await logActivity(req, 'contact.create', `New contact message from ${message.email}`);
    res.status(201).json({ success: true, message: 'Message received.', data: { message } });
  } catch (err) { next(err); }
}

module.exports = { create };
