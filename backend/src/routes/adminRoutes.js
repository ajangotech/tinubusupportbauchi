const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/adminController');
const auth = require('../middleware/authMiddleware');
const {
  requireStaff, requireAdmin, requireMembershipOfficer, requireCorporateOfficer,
} = require('../middleware/roleMiddleware');
const validate = require('../middleware/validationMiddleware');
const v = require('../validations/commonValidation');
const vMember = require('../validations/memberValidation');
const vCorporate = require('../validations/corporateValidation');

router.use(auth, requireStaff);

// Dashboard
router.get('/dashboard', ctrl.dashboard);

// Members
router.get('/members', requireMembershipOfficer, ctrl.listMembers);
router.get('/members/:id', requireMembershipOfficer, ctrl.getMember);
router.put('/members/:id/approve', requireMembershipOfficer, ctrl.approveMember);
router.put('/members/:id/reject', requireMembershipOfficer, validate(vMember.rejectSchema, 'body'), ctrl.rejectMember);
router.put('/members/:id/suspend', requireMembershipOfficer, ctrl.suspendMember);

// Corporates
router.get('/corporates', requireCorporateOfficer, ctrl.listCorporates);
router.get('/corporates/:id', requireCorporateOfficer, ctrl.getCorporate);
router.put('/corporates/:id/approve', requireCorporateOfficer, ctrl.approveCorporate);
router.put('/corporates/:id/reject', requireCorporateOfficer, validate(vCorporate.rejectSchema, 'body'), ctrl.rejectCorporate);

// Contact messages
router.get('/messages', ctrl.listMessages);
router.put('/messages/:id', validate(v.messageStatusSchema, 'body'), ctrl.updateMessageStatus);
router.delete('/messages/:id', ctrl.deleteMessage);

// Newsletter subscribers
router.get('/subscribers', ctrl.listSubscribers);
router.delete('/subscribers/:id', ctrl.deleteSubscriber);

// Users
router.get('/users', requireAdmin, ctrl.listUsers);
router.put('/users/:id', requireAdmin, ctrl.updateUser);

// Notifications
router.post('/notifications', requireAdmin, validate(v.notificationSchema, 'body'), ctrl.sendNotification);

// Activity logs
router.get('/logs', requireAdmin, ctrl.listLogs);

module.exports = router;
