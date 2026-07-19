const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/newsletterController');
const validate = require('../middleware/validationMiddleware');
const v = require('../validations/commonValidation');

router.post('/subscribe', validate(v.newsletterSchema, 'body'), ctrl.subscribe);
router.get('/unsubscribe', ctrl.unsubscribe);

module.exports = router;
