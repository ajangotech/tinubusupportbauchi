const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');
const { authLimiter } = require('../middleware/rateLimitMiddleware');
const v = require('../validations/authValidation');

router.post('/register', authLimiter, validate(v.registerSchema, 'body'), ctrl.register);
router.post('/login', authLimiter, validate(v.loginSchema, 'body'), ctrl.login);
router.post('/logout', auth, ctrl.logout);
router.get('/me', auth, ctrl.me);
router.put('/me', auth, validate(v.updateMeSchema, 'body'), ctrl.updateMe);
router.post('/forgot-password', authLimiter, validate(v.forgotPasswordSchema, 'body'), ctrl.forgotPassword);
router.post('/reset-password', authLimiter, validate(v.resetPasswordSchema, 'body'), ctrl.resetPassword);

module.exports = router;
