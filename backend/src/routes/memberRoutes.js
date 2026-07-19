const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/memberController');
const auth = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');
const { uploadImage } = require('../middleware/uploadMiddleware');
const v = require('../validations/memberValidation');

// Public verification (no sensitive data exposed)
router.get('/verify/:membershipNumber', ctrl.verify);

// Member self-registration (optionally authenticated)
router.post(
  '/register',
  uploadImage('members').single('passportPhoto'),
  validate(v.registerSchema, 'body'),
  ctrl.register,
);

// Authenticated member routes
router.use(auth);
router.get('/profile', ctrl.getProfile);
router.put(
  '/profile',
  uploadImage('members').single('passportPhoto'),
  validate(v.updateProfileSchema, 'body'),
  ctrl.updateProfile,
);
router.get('/card', ctrl.downloadCard);

module.exports = router;
