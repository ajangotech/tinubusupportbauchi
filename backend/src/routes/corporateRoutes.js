const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/corporateController');
const auth = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');
const { uploadImage, uploadDocument } = require('../middleware/uploadMiddleware');
const v = require('../validations/corporateValidation');

// Corporate self-registration (optionally authenticated)
router.post(
  '/register',
  uploadImage('corporate').single('organizationLogo'),
  uploadDocument('corporate').array('supportingDocuments', 5),
  validate(v.registerSchema, 'body'),
  ctrl.register,
);

// Authenticated corporate routes
router.use(auth);
router.get('/profile', ctrl.getProfile);
router.put(
  '/profile',
  uploadImage('corporate').single('organizationLogo'),
  validate(v.updateProfileSchema, 'body'),
  ctrl.updateProfile,
);
router.get('/certificate', ctrl.downloadCertificate);

module.exports = router;
