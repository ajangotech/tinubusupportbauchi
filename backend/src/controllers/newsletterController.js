const { NewsletterSubscriber } = require('../models');
const { generateToken } = require('../services/idService');
const { logActivity } = require('../middleware/activityLogMiddleware');

async function subscribe(req, res, next) {
  try {
    const { email } = req.body;
    let sub = await NewsletterSubscriber.findOne({ where: { email } });
    if (sub) {
      if (sub.status === 'subscribed') {
        return res.json({ success: true, message: 'Already subscribed.' });
      }
      sub.status = 'subscribed';
      sub.token = generateToken();
      await sub.save();
      return res.json({ success: true, message: 'Re-subscribed.' });
    }
    sub = await NewsletterSubscriber.create({ email, status: 'subscribed', token: generateToken() });
    await logActivity(req, 'newsletter.subscribe', `New subscriber ${email}`);
    res.status(201).json({ success: true, message: 'Subscribed.', data: { subscriber: sub } });
  } catch (err) { next(err); }
}

async function unsubscribe(req, res, next) {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ success: false, message: 'Token required.' });
    const sub = await NewsletterSubscriber.findOne({ where: { token } });
    if (!sub) return res.status(404).json({ success: false, message: 'Subscriber not found.' });
    sub.status = 'unsubscribed';
    await sub.save();
    res.json({ success: true, message: 'Unsubscribed.' });
  } catch (err) { next(err); }
}

module.exports = { subscribe, unsubscribe };
