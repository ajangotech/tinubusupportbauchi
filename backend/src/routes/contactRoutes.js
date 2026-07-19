const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/contactController');
const validate = require('../middleware/validationMiddleware');
const { contactLimiter } = require('../middleware/rateLimitMiddleware');
const v = require('../validations/commonValidation');

router.post('/', contactLimiter, validate(v.contactSchema, 'body'), ctrl.create);

module.exports = router;
