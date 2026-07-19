const { Op } = require('sequelize');
const slugify = require('slugify');
const { Event } = require('../models');
const { logActivity } = require('../middleware/activityLogMiddleware');

async function listPublic(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
    const { status, search } = req.query;
    const where = { status: { [Op.in]: ['upcoming', 'ongoing'] } };
    if (status) where.status = status;
    if (search) where.title = { [Op.like]: `%${search}%` };
    const { rows, count } = await Event.findAndCountAll({
      where,
      order: [['eventDate', 'ASC']],
      limit,
      offset: (page - 1) * limit,
    });
    res.json({
      success: true,
      data: { items: rows, total: count, page, limit, totalPages: Math.ceil(count / limit) },
    });
  } catch (err) { next(err); }
}

async function getBySlug(req, res, next) {
  try {
    const event = await Event.findOne({ where: { slug: req.params.slug } });
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });
    res.json({ success: true, data: { event } });
  } catch (err) { next(err); }
}

async function adminList(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const { rows, count } = await Event.findAndCountAll({
      order: [['eventDate', 'DESC']],
      limit,
      offset: (page - 1) * limit,
    });
    res.json({
      success: true,
      data: { items: rows, total: count, page, limit, totalPages: Math.ceil(count / limit) },
    });
  } catch (err) { next(err); }
}

async function adminCreate(req, res, next) {
  try {
    const data = { ...req.body };
    data.slug = data.slug || slugify(data.title, { lower: true, strict: true });
    if (req.file) data.featuredImage = `blog/${req.file.filename}`;
    const event = await Event.create(data);
    await logActivity(req, 'event.create', `Created event: ${event.title}`);
    res.status(201).json({ success: true, data: { event } });
  } catch (err) { next(err); }
}

async function adminUpdate(req, res, next) {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });
    const allowed = ['title', 'slug', 'description', 'eventDate', 'eventTime', 'location',
      'featuredImage', 'status'];
    for (const k of allowed) if (req.body[k] !== undefined) event[k] = req.body[k];
    if (req.file) event.featuredImage = `blog/${req.file.filename}`;
    await event.save();
    await logActivity(req, 'event.update', `Updated event ${event.id}`);
    res.json({ success: true, data: { event } });
  } catch (err) { next(err); }
}

async function adminDelete(req, res, next) {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });
    await event.destroy();
    await logActivity(req, 'event.delete', `Deleted event ${event.id}`);
    res.json({ success: true, message: 'Event deleted.' });
  } catch (err) { next(err); }
}

module.exports = { listPublic, getBySlug, adminList, adminCreate, adminUpdate, adminDelete };
