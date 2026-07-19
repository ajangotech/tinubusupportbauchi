const { Op } = require('sequelize');
const { Notification } = require('../models');

async function listMine(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const where = {
      [Op.or]: [{ userId: req.user.id }, { userId: null }],
    };
    if (req.query.unread === '1' || req.query.unread === 'true') where.readAt = null;
    const { rows, count } = await Notification.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit,
      offset: (page - 1) * limit,
    });
    res.json({
      success: true,
      data: { items: rows, total: count, page, limit, totalPages: Math.ceil(count / limit) },
    });
  } catch (err) { next(err); }
}

async function markRead(req, res, next) {
  try {
    const n = await Notification.findByPk(req.params.id);
    if (!n) return res.status(404).json({ success: false, message: 'Notification not found.' });
    if (n.userId && n.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not allowed.' });
    }
    n.readAt = new Date();
    await n.save();
    res.json({ success: true, data: { notification: n } });
  } catch (err) { next(err); }
}

async function markAllRead(req, res, next) {
  try {
    await Notification.update(
      { readAt: new Date() },
      { where: { [Op.or]: [{ userId: req.user.id }, { userId: null }], readAt: null } }
    );
    res.json({ success: true, message: 'All marked as read.' });
  } catch (err) { next(err); }
}

async function destroy(req, res, next) {
  try {
    const n = await Notification.findByPk(req.params.id);
    if (!n) return res.status(404).json({ success: false, message: 'Notification not found.' });
    if (n.userId && n.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not allowed.' });
    }
    await n.destroy();
    res.json({ success: true, message: 'Deleted.' });
  } catch (err) { next(err); }
}

module.exports = { listMine, markRead, markAllRead, destroy };
