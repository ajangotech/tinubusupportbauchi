/**
 * Role-based access control middleware.
 * Usage: router.delete('/posts/:id', authenticate, requireRoles('admin', 'super_admin'), handler)
 */
function requireRoles(...roles) {
  const allowed = new Set(roles);
  return function (req, res, next) {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    if (!allowed.has(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions.' });
    }
    next();
  };
}

// Convenience: any authenticated staff role
const requireStaff = requireRoles('super_admin', 'admin', 'membership_officer', 'corporate_officer', 'editor');
const requireAdmin = requireRoles('super_admin', 'admin');
const requireSuperAdmin = requireRoles('super_admin');
const requireEditor = requireRoles('super_admin', 'admin', 'editor');
const requireMembershipOfficer = requireRoles('super_admin', 'admin', 'membership_officer');
const requireCorporateOfficer = requireRoles('super_admin', 'admin', 'corporate_officer');

module.exports = {
  requireRoles,
  requireStaff,
  requireAdmin,
  requireSuperAdmin,
  requireEditor,
  requireMembershipOfficer,
  requireCorporateOfficer,
};
