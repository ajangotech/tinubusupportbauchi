const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CorporateOrganization = sequelize.define('CorporateOrganization', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true, unsigned: true },
  userId: { type: DataTypes.BIGINT, field: 'user_id', unsigned: true },
  corporateNumber: { type: DataTypes.STRING(40), field: 'corporate_number', unique: true, allowNull: false },
  organizationName: { type: DataTypes.STRING(190), field: 'organization_name', allowNull: false },
  organizationType: { type: DataTypes.STRING(120), field: 'organization_type' },
  registrationNumber: { type: DataTypes.STRING(80), field: 'registration_number' },
  contactPerson: { type: DataTypes.STRING(150), field: 'contact_person' },
  phone: { type: DataTypes.STRING(30) },
  email: { type: DataTypes.STRING(190), validate: { isEmail: true } },
  state: { type: DataTypes.STRING(80) },
  lga: { type: DataTypes.STRING(80) },
  officeAddress: { type: DataTypes.STRING(255), field: 'office_address' },
  website: { type: DataTypes.STRING(190), validate: { isUrl: true } },
  organizationLogo: { type: DataTypes.STRING(255), field: 'organization_logo' },
  supportArea: { type: DataTypes.STRING(255), field: 'support_area' },
  supportingDocuments: { type: DataTypes.JSON, field: 'supporting_documents', defaultValue: [] },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'suspended'),
    allowNull: false, defaultValue: 'pending',
  },
  approvedAt: { type: DataTypes.DATE, field: 'approved_at' },
  approvedBy: { type: DataTypes.BIGINT, field: 'approved_by', unsigned: true },
  rejectionReason: { type: DataTypes.STRING(255), field: 'rejection_reason' },
}, { tableName: 'corporate_organizations', timestamps: true });

module.exports = CorporateOrganization;
