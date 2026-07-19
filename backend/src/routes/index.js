const express = require('express');
const router = express.Router();

router.use('/auth', require('./authRoutes'));
router.use('/members', require('./memberRoutes'));
router.use('/corporate', require('./corporateRoutes'));
router.use('/blog', require('./blogRoutes'));
router.use('/events', require('./eventRoutes'));
router.use('/leadership', require('./leadershipRoutes'));
router.use('/contact', require('./contactRoutes'));
router.use('/newsletter', require('./newsletterRoutes'));
router.use('/notifications', require('./notificationRoutes'));
router.use('/admin', require('./adminRoutes'));

module.exports = router;
