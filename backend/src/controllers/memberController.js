const path = require('path');
const { Member, User, ActivityLog } = require('../models');
const { Op } = require('sequelize');
const env = require('../config/environment');
const { generateMembershipNumber } = require('../services/idService');
const emailService = require('../services/emailService');
const notificationService = require('../services/notificationService');
const { buildMembershipCardPdf } = require('../services/membershipCardService');
const { publicUrl } = require('../middleware/uploadMiddleware');
const { logActivity } = require('../middleware/activityLogMiddleware');

async function register(req, res, next) {
  try {
    const data = { ...req.body };
    data.membershipNumber = await uniqueMembershipNumber();
    data.registrationDate = data.registrationDate || new Date().toISOString().slice(0, 10);
    data.status = 'pending';
    if (req.file) data.passportPhoto = `members/${req.file.filename}`;

    // Link to authenticated user if available
    if (req.user && !data.userId) data.userId = req.user.id;

    const member = await Member.create(data);
    await logActivity(req, 'member.register', `New member: ${member.membershipNumber}`);
    await notificationService.notifyAdmins('New member registration',
      `Member ${member.fullName()} (${member.membershipNumber}) is pending approval.`, 'member');

    res.status(201).json({
      success: true,
      message: 'Registration submitted. You will be notified after admin approval.',
      data: { member },
    });
  } catch (err) { next(err); }
}

async function getProfile(req, res, next) {
  try {
    const member = await findMemberForUser(req.user);
    if (!member) return res.status(404).json({ success: false, message: 'No member profile found.' });
    res.json({ success: true, data: { member } });
  } catch (err) { next(err); }
}

async function updateProfile(req, res, next) {
  try {
    const member = await findMemberForUser(req.user);
    if (!member) return res.status(404).json({ success: false, message: 'No member profile found.' });
    const allowed = ['firstName', 'middleName', 'lastName', 'gender', 'dateOfBirth', 'phone',
      'email', 'nin', 'occupation', 'state', 'lga', 'ward', 'pollingUnit', 'address'];
    for (const k of allowed) if (req.body[k] !== undefined) member[k] = req.body[k];
    if (req.file) member.passportPhoto = `members/${req.file.filename}`;
    await member.save();
    await logActivity(req, 'member.update_profile', `Updated member ${member.membershipNumber}`);
    res.json({ success: true, data: { member } });
  } catch (err) { next(err); }
}

async function downloadCard(req, res, next) {
  try {
    const member = await findMemberForUser(req.user);
    if (!member) return res.status(404).json({ success: false, message: 'No member profile found.' });
    if (member.status !== 'approved') {
      return res.status(403).json({ success: false, message: 'Membership not approved.' });
    }
    const pdf = await buildMembershipCardPdf(member);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="membership-card-${member.membershipNumber}.pdf"`);
    res.send(pdf);
  } catch (err) { next(err); }
}

async function verify(req, res, next) {
  try {
    const { membershipNumber } = req.params;
    const member = await Member.findOne({ where: { membershipNumber } });
    if (!member || member.status !== 'approved') {
      return res.status(404).json({ success: false, message: 'Membership not found or not valid.' });
    }
    // Do NOT expose sensitive information (NIN, address, DOB, phone, email)
    res.json({
      success: true,
      data: {
        membershipNumber: member.membershipNumber,
        fullName: member.fullName(),
        status: member.status,
        lga: member.lga,
        ward: member.ward,
        registrationDate: member.registrationDate,
      },
    });
  } catch (err) { next(err); }
}

async function findMemberForUser(user) {
  if (!user) return null;
  return Member.findOne({ where: { userId: user.id } });
}

async function uniqueMembershipNumber() {
  for (let i = 0; i < 10; i++) {
    const num = generateMembershipNumber();
    const exists = await Member.findOne({ where: { membershipNumber: num } });
    if (!exists) return num;
  }
  throw new Error('Unable to generate unique membership number.');
}

module.exports = { register, getProfile, updateProfile, downloadCard, verify };
