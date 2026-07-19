const { Leadership } = require('../models');
const { logActivity } = require('../middleware/activityLogMiddleware');

async function listPublic(req, res, next) {
  try {
    const leaders = await Leadership.findAll({
      where: { status: 'active' },
      order: [['id', 'ASC']],
    });
    res.json({ success: true, data: { leaders } });
  } catch (err) { next(err); }
}

async function adminList(req, res, next) {
  try {
    const leaders = await Leadership.findAll({ order: [['id', 'ASC']] });
    res.json({ success: true, data: { leaders } });
  } catch (err) { next(err); }
}

async function adminCreate(req, res, next) {
  try {
    const data = { ...req.body };
    if (req.file) data.photo = `leadership/${req.file.filename}`;
    const leader = await Leadership.create(data);
    await logActivity(req, 'leadership.create', `Created leader: ${leader.name}`);
    res.status(201).json({ success: true, data: { leader } });
  } catch (err) { next(err); }
}

async function adminUpdate(req, res, next) {
  try {
    const leader = await Leadership.findByPk(req.params.id);
    if (!leader) return res.status(404).json({ success: false, message: 'Leader not found.' });
    const allowed = ['name', 'position', 'biography', 'photo', 'socialLinks', 'status'];
    for (const k of allowed) if (req.body[k] !== undefined) leader[k] = req.body[k];
    if (req.file) leader.photo = `leadership/${req.file.filename}`;
    await leader.save();
    await logActivity(req, 'leadership.update', `Updated leader ${leader.id}`);
    res.json({ success: true, data: { leader } });
  } catch (err) { next(err); }
}

async function adminDelete(req, res, next) {
  try {
    const leader = await Leadership.findByPk(req.params.id);
    if (!leader) return res.status(404).json({ success: false, message: 'Leader not found.' });
    await leader.destroy();
    await logActivity(req, 'leadership.delete', `Deleted leader ${leader.id}`);
    res.json({ success: true, message: 'Leader deleted.' });
  } catch (err) { next(err); }
}

module.exports = { listPublic, adminList, adminCreate, adminUpdate, adminDelete };
