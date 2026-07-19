const { Op } = require('sequelize');
const {
  sequelize, User, Member, CorporateOrganization, BlogPost, BlogCategory,
  Event, Leadership, ContactMessage, NewsletterSubscriber, Notification, ActivityLog,
} = require('../models');
const emailService = require('../services/emailService');
const notificationService = require('../services/notificationService');
const { logActivity } = require('../middleware/activityLogMiddleware');

// ---------- Dashboard ----------
async function dashboard(req, res, next) {
  try {
    const [
      membersTotal, membersPending, membersApproved,
      corporatesTotal, corporatesPending, corporatesApproved,
      postsTotal, postsPublished,
      eventsTotal, eventsUpcoming,
      messagesNew, subscribersActive, usersTotal,
    ] = await Promise.all([
      Member.count(), Member.count({ where: { status: 'pending' } }), Member.count({ where: { status: 'approved' } }),
      CorporateOrganization.count(), CorporateOrganization.count({ where: { status: 'pending' } }), CorporateOrganization.count({ where: { status: 'approved' } }),
      BlogPost.count(), BlogPost.count({ where: { status: 'published' } }),
      Event.count(), Event.count({ where: { status: 'upcoming' } }),
      ContactMessage.count({ where: { status: 'new' } }), NewsletterSubscriber.count({ where: { status: 'subscribed' } }), User.count(),
    ]);

    res.json({
      success: true,
      data: {
        counts: {
          members: membersTotal, membersPending, membersApproved,
          corporates: corporatesTotal, corporatesPending, corporatesApproved,
          posts: postsTotal, postsPublished,
          events: eventsTotal, eventsUpcoming,
          messagesNew, subscribersActive, users: usersTotal,
        },
      },
    });
  } catch (err) { next(err); }
}

// ---------- Members ----------
async function listMembers(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const { status, search } = req.query;
    const where = {};
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { membershipNumber: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }
    const { rows, count } = await Member.findAndCountAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['id', 'email', 'role'] }],
      order: [['createdAt', 'DESC']],
      limit,
      offset: (page - 1) * limit,
      distinct: true,
    });
    res.json({
      success: true,
      data: { items: rows, total: count, page, limit, totalPages: Math.ceil(count / limit) },
    });
  } catch (err) { next(err); }
}

async function getMember(req, res, next) {
  try {
    const member = await Member.findByPk(req.params.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'email', 'role'] }],
    });
    if (!member) return res.status(404).json({ success: false, message: 'Member not found.' });
    res.json({ success: true, data: { member } });
  } catch (err) { next(err); }
}

async function approveMember(req, res, next) {
  try {
    const member = await Member.findByPk(req.params.id);
    if (!member) return res.status(404).json({ success: false, message: 'Member not found.' });
    member.status = 'approved';
    member.approvedAt = new Date();
    member.approvedBy = req.user.id;
    member.rejectionReason = null;
    await member.save();
    await logActivity(req, 'member.approve', `Approved member ${member.membershipNumber}`);
    if (member.email) {
      await emailService.sendMemberApproved({ to: member.email, name: member.fullName(), membershipNumber: member.membershipNumber });
    }
    if (member.userId) {
      await notificationService.notifyUser(member.userId, 'Membership Approved',
        `Your membership (${member.membershipNumber}) has been approved. You can now download your membership card.`, 'member');
    }
    res.json({ success: true, data: { member } });
  } catch (err) { next(err); }
}

async function rejectMember(req, res, next) {
  try {
    const member = await Member.findByPk(req.params.id);
    if (!member) return res.status(404).json({ success: false, message: 'Member not found.' });
    member.status = 'rejected';
    member.rejectionReason = req.body.reason || null;
    await member.save();
    await logActivity(req, 'member.reject', `Rejected member ${member.membershipNumber}`);
    if (member.email) {
      await emailService.sendMemberRejected({ to: member.email, name: member.fullName(), reason: member.rejectionReason });
    }
    if (member.userId) {
      await notificationService.notifyUser(member.userId, 'Membership Rejected',
        `Your membership application was rejected. ${member.rejectionReason || ''}`.trim(), 'member');
    }
    res.json({ success: true, data: { member } });
  } catch (err) { next(err); }
}

async function suspendMember(req, res, next) {
  try {
    const member = await Member.findByPk(req.params.id);
    if (!member) return res.status(404).json({ success: false, message: 'Member not found.' });
    member.status = 'suspended';
    await member.save();
    await logActivity(req, 'member.suspend', `Suspended member ${member.membershipNumber}`);
    res.json({ success: true, data: { member } });
  } catch (err) { next(err); }
}

// ---------- Corporates ----------
async function listCorporates(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const { status, search } = req.query;
    const where = {};
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { organizationName: { [Op.like]: `%${search}%` } },
        { corporateNumber: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }
    const { rows, count } = await CorporateOrganization.findAndCountAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['id', 'email', 'role'] }],
      order: [['createdAt', 'DESC']],
      limit,
      offset: (page - 1) * limit,
      distinct: true,
    });
    res.json({
      success: true,
      data: { items: rows, total: count, page, limit, totalPages: Math.ceil(count / limit) },
    });
  } catch (err) { next(err); }
}

async function getCorporate(req, res, next) {
  try {
    const org = await CorporateOrganization.findByPk(req.params.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'email', 'role'] }],
    });
    if (!org) return res.status(404).json({ success: false, message: 'Corporate not found.' });
    res.json({ success: true, data: { organization: org } });
  } catch (err) { next(err); }
}

async function approveCorporate(req, res, next) {
  try {
    const org = await CorporateOrganization.findByPk(req.params.id);
    if (!org) return res.status(404).json({ success: false, message: 'Corporate not found.' });
    org.status = 'approved';
    org.approvedAt = new Date();
    org.approvedBy = req.user.id;
    org.rejectionReason = null;
    await org.save();
    await logActivity(req, 'corporate.approve', `Approved corporate ${org.corporateNumber}`);
    if (org.email) {
      await emailService.sendCorporateApproved({ to: org.email, name: org.contactPerson || org.organizationName, corporateNumber: org.corporateNumber });
    }
    if (org.userId) {
      await notificationService.notifyUser(org.userId, 'Corporate Registration Approved',
        `Your corporate registration (${org.corporateNumber}) has been approved.`, 'corporate');
    }
    res.json({ success: true, data: { organization: org } });
  } catch (err) { next(err); }
}

async function rejectCorporate(req, res, next) {
  try {
    const org = await CorporateOrganization.findByPk(req.params.id);
    if (!org) return res.status(404).json({ success: false, message: 'Corporate not found.' });
    org.status = 'rejected';
    org.rejectionReason = req.body.reason || null;
    await org.save();
    await logActivity(req, 'corporate.reject', `Rejected corporate ${org.corporateNumber}`);
    if (org.email) {
      await emailService.sendCorporateRejected({ to: org.email, name: org.contactPerson || org.organizationName, reason: org.rejectionReason });
    }
    res.json({ success: true, data: { organization: org } });
  } catch (err) { next(err); }
}

// ---------- Contact messages ----------
async function listMessages(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const { status } = req.query;
    const where = status ? { status } : {};
    const { rows, count } = await ContactMessage.findAndCountAll({
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

async function updateMessageStatus(req, res, next) {
  try {
    const msg = await ContactMessage.findByPk(req.params.id);
    if (!msg) return res.status(404).json({ success: false, message: 'Message not found.' });
    const { status } = req.body;
    if (!['new', 'read', 'replied', 'archived'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }
    msg.status = status;
    await msg.save();
    res.json({ success: true, data: { message: msg } });
  } catch (err) { next(err); }
}

async function deleteMessage(req, res, next) {
  try {
    const msg = await ContactMessage.findByPk(req.params.id);
    if (!msg) return res.status(404).json({ success: false, message: 'Message not found.' });
    await msg.destroy();
    res.json({ success: true, message: 'Message deleted.' });
  } catch (err) { next(err); }
}

// ---------- Newsletter ----------
async function listSubscribers(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
    const { rows, count } = await NewsletterSubscriber.findAndCountAll({
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

async function deleteSubscriber(req, res, next) {
  try {
    const sub = await NewsletterSubscriber.findByPk(req.params.id);
    if (!sub) return res.status(404).json({ success: false, message: 'Subscriber not found.' });
    await sub.destroy();
    res.json({ success: true, message: 'Subscriber deleted.' });
  } catch (err) { next(err); }
}

// ---------- Users ----------
async function listUsers(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const { role, search } = req.query;
    const where = {};
    if (role) where.role = role;
    if (search) where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
    ];
    const { rows, count } = await User.findAndCountAll({
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

async function updateUser(req, res, next) {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    const { name, phone, role, status, password } = req.body;
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (role) user.role = role;
    if (status) user.status = status;
    if (password) user.password = password;
    await user.save();
    await logActivity(req, 'user.update', `Updated user ${user.id}`);
    res.json({ success: true, data: { user } });
  } catch (err) { next(err); }
}

// ---------- Notifications (admin send) ----------
async function sendNotification(req, res, next) {
  try {
    const { userId, title, message, type } = req.body;
    const n = await notificationService.createNotification({ userId: userId || null, title, message, type });
    res.status(201).json({ success: true, data: { notification: n } });
  } catch (err) { next(err); }
}

// ---------- Activity logs ----------
async function listLogs(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
    const { action, userId } = req.query;
    const where = {};
    if (action) where.action = action;
    if (userId) where.userId = userId;
    const { rows, count } = await ActivityLog.findAndCountAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'DESC']],
      limit,
      offset: (page - 1) * limit,
      distinct: true,
    });
    res.json({
      success: true,
      data: { items: rows, total: count, page, limit, totalPages: Math.ceil(count / limit) },
    });
  } catch (err) { next(err); }
}

module.exports = {
  dashboard,
  listMembers, getMember, approveMember, rejectMember, suspendMember,
  listCorporates, getCorporate, approveCorporate, rejectCorporate,
  listMessages, updateMessageStatus, deleteMessage,
  listSubscribers, deleteSubscriber,
  listUsers, updateUser,
  sendNotification,
  listLogs,
};
