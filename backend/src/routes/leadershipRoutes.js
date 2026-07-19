const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/leadershipController');
const auth = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');
const validate = require('../middleware/validationMiddleware');
const { uploadImage } = require('../middleware/uploadMiddleware');
const v = require('../validations/commonValidation');

// Public
router.get('/', ctrl.listPublic);

// Admin
router.use(auth, requireAdmin);
router.get('/admin/list', ctrl.adminList);
router.post(
  '/',
  uploadImage('leadership').single('photo'),
  validate(v.leadershipSchema, 'body'),
  ctrl.adminCreate,
);
router.put(
  '/:id',
  uploadImage('leadership').single('photo'),
  validate(v.leadershipSchema, 'body'),
  ctrl.adminUpdate,
);
router.delete('/:id', ctrl.adminDelete);

module.exports = router;
