const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/blogController');
const auth = require('../middleware/authMiddleware');
const { requireEditor } = require('../middleware/roleMiddleware');
const validate = require('../middleware/validationMiddleware');
const { uploadImage } = require('../middleware/uploadMiddleware');
const v = require('../validations/commonValidation');

// Public
router.get('/', ctrl.listPublic);
router.get('/categories', ctrl.listCategories);
router.get('/:slug', ctrl.getBySlug);

// Admin (editor+)
router.use(auth, requireEditor);
router.get('/admin/list', ctrl.adminList);
router.post(
  '/',
  uploadImage('blog').single('featuredImage'),
  validate(v.blogPostSchema, 'body'),
  ctrl.adminCreate,
);
router.post('/categories', validate(v.blogCategorySchema, 'body'), ctrl.adminCreateCategory);
router.put(
  '/:id',
  uploadImage('blog').single('featuredImage'),
  validate(v.blogPostSchema, 'body'),
  ctrl.adminUpdate,
);
router.delete('/:id', ctrl.adminDelete);

module.exports = router;
