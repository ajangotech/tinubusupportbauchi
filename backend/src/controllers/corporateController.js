const { CorporateOrganization } = require('../models');
const { generateCorporateNumber } = require('../services/idService');
const emailService = require('../services/emailService');
const notificationService = require('../services/notificationService');
const { buildCorporateCertificatePdf } = require('../services/corporateCertificateService');
const { logActivity } = require('../middleware/activityLogMiddleware');

async function register(req, res, next) {
  try {
    const data = { ...req.body };
    data.corporateNumber = await uniqueCorporateNumber();
    data.status = 'pending';
    if (req.file) data.organizationLogo = `corporate/${req.file.filename}`;
    if (req.files && req.files.length) {
      data.supportingDocuments = req.files.map((f) => `corporate/${f.filename}`);
    }
    if (req.user && !data.userId) data.userId = req.user.id;

    const org = await CorporateOrganization.create(data);
    await logActivity(req, 'corporate.register', `New corporate: ${org.corporateNumber}`);
    await notificationService.notifyAdmins('New corporate registration',
      `${org.organizationName} (${org.corporateNumber}) is pending approval.`, 'corporate');

    res.status(201).json({
      success: true,
      message: 'Registration submitted. You will be notified after admin approval.',
      data: { organization: org },
    });
  } catch (err) { next(err); }
}

async function getProfile(req, res, next) {
  try {
    const org = await findCorporateForUser(req.user);
    if (!org) return res.status(404).json({ success: false, message: 'No corporate profile found.' });
    res.json({ success: true, data: { organization: org } });
  } catch (err) { next(err); }
}

async function updateProfile(req, res, next) {
  try {
    const org = await findCorporateForUser(req.user);
    if (!org) return res.status(404).json({ success: false, message: 'No corporate profile found.' });
    const allowed = ['organizationName', 'organizationType', 'registrationNumber', 'contactPerson',
      'phone', 'email', 'state', 'lga', 'officeAddress', 'website', 'supportArea'];
    for (const k of allowed) if (req.body[k] !== undefined) org[k] = req.body[k];
    if (req.file) org.organizationLogo = `corporate/${req.file.filename}`;
    await org.save();
    await logActivity(req, 'corporate.update_profile', `Updated corporate ${org.corporateNumber}`);
    res.json({ success: true, data: { organization: org } });
  } catch (err) { next(err); }
}

async function downloadCertificate(req, res, next) {
  try {
    const org = await findCorporateForUser(req.user);
    if (!org) return res.status(404).json({ success: false, message: 'No corporate profile found.' });
    if (org.status !== 'approved') {
      return res.status(403).json({ success: false, message: 'Corporate registration not approved.' });
    }
    const pdf = await buildCorporateCertificatePdf(org);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="corporate-certificate-${org.corporateNumber}.pdf"`);
    res.send(pdf);
  } catch (err) { next(err); }
}

async function findCorporateForUser(user) {
  if (!user) return null;
  return CorporateOrganization.findOne({ where: { userId: user.id } });
}

async function uniqueCorporateNumber() {
  for (let i = 0; i < 10; i++) {
    const num = generateCorporateNumber();
    const exists = await CorporateOrganization.findOne({ where: { corporateNumber: num } });
    if (!exists) return num;
  }
  throw new Error('Unable to generate unique corporate number.');
}

module.exports = { register, getProfile, updateProfile, downloadCertificate };
