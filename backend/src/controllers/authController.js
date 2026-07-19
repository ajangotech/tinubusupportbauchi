const jwt = require('jsonwebtoken');
const env = require('../config/environment');
const { User } = require('../models');
const { sendMail } = require('../config/mail');
const emailService = require('../services/emailService');
const { generateToken } = require('../services/idService');
const { logActivity } = require('../middleware/activityLogMiddleware');

function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, env.jwt.secret, { expiresIn: env.jwt.expiresIn });
}

async function register(req, res, next) {
  try {
    const { name, email, phone, password, role } = req.body;
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }
    const user = await User.create({ name, email, phone, password, role });
    await logActivity(req, 'auth.register', `New ${role} account: ${email}`);
    await emailService.sendWelcome({ to: email, name });
    const token = signToken(user);
    res.status(201).json({ success: true, message: 'Account created.', data: { user, token } });
  } catch (err) { next(err); }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }
    if (user.status !== 'active') {
      return res.status(403).json({ success: false, message: 'Account is not active.' });
    }
    user.lastLoginAt = new Date();
    await user.save();
    await logActivity(req, 'auth.login', `User logged in: ${email}`);
    const token = signToken(user);
    res.json({ success: true, data: { user, token } });
  } catch (err) { next(err); }
}

async function logout(req, res, next) {
  try {
    if (req.user) await logActivity(req, 'auth.logout', `User logged out: ${req.user.email}`);
    res.json({ success: true, message: 'Logged out.' });
  } catch (err) { next(err); }
}

async function me(req, res, next) {
  try {
    res.json({ success: true, data: { user: req.user } });
  } catch (err) { next(err); }
}

async function updateMe(req, res, next) {
  try {
    const { name, phone, password } = req.body;
    if (name) req.user.name = name;
    if (phone !== undefined) req.user.phone = phone;
    if (password) req.user.password = password;
    await req.user.save();
    await logActivity(req, 'auth.update_me', 'Profile updated');
    res.json({ success: true, data: { user: req.user } });
  } catch (err) { next(err); }
}

async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (user) {
      const token = generateToken();
      user.resetToken = token;
      user.resetExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
      await user.save();
      const resetUrl = `${env.clientUrl}/reset-password?token=${token}`;
      await emailService.sendPasswordReset({ to: user.email, name: user.name, resetUrl });
      await logActivity(req, 'auth.forgot_password', `Password reset requested for ${email}`);
    }
    // Always respond success to avoid email enumeration
    res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
  } catch (err) { next(err); }
}

async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body;
    const user = await User.findOne({ where: { resetToken: token } });
    if (!user || !user.resetExpiresAt || user.resetExpiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token.' });
    }
    user.password = password;
    user.resetToken = null;
    user.resetExpiresAt = null;
    await user.save();
    await logActivity(req, 'auth.reset_password', `Password reset for ${user.email}`);
    res.json({ success: true, message: 'Password reset successful.' });
  } catch (err) { next(err); }
}

module.exports = { register, login, logout, me, updateMe, forgotPassword, resetPassword, signToken };
