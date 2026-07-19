const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Member = sequelize.define('Member', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true, unsigned: true },
  userId: { type: DataTypes.BIGINT, field: 'user_id', unsigned: true },
  membershipNumber: { type: DataTypes.STRING(40), field: 'membership_number', unique: true, allowNull: false },
  firstName: { type: DataTypes.STRING(80), field: 'first_name', allowNull: false },
  middleName: { type: DataTypes.STRING(80), field: 'middle_name' },
  lastName: { type: DataTypes.STRING(80), field: 'last_name', allowNull: false },
  gender: { type: DataTypes.ENUM('male', 'female', 'other') },
  dateOfBirth: { type: DataTypes.DATEONLY, field: 'date_of_birth' },
  phone: { type: DataTypes.STRING(30) },
  email: { type: DataTypes.STRING(190), validate: { isEmail: true } },
  nin: { type: DataTypes.STRING(20) },
  occupation: { type: DataTypes.STRING(150) },
  state: { type: DataTypes.STRING(80) },
  lga: { type: DataTypes.STRING(80) },
  ward: { type: DataTypes.STRING(80) },
  pollingUnit: { type: DataTypes.STRING(120), field: 'polling_unit' },
  address: { type: DataTypes.STRING(255) },
  passportPhoto: { type: DataTypes.STRING(255), field: 'passport_photo' },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'suspended'),
    allowNull: false, defaultValue: 'pending',
  },
  registrationDate: { type: DataTypes.DATEONLY, field: 'registration_date', allowNull: false },
  approvedAt: { type: DataTypes.DATE, field: 'approved_at' },
  approvedBy: { type: DataTypes.BIGINT, field: 'approved_by', unsigned: true },
  rejectionReason: { type: DataTypes.STRING(255), field: 'rejection_reason' },
}, { tableName: 'members', timestamps: true });

Member.prototype.fullName = function () {
  return [this.firstName, this.middleName, this.lastName].filter(Boolean).join(' ');
};

module.exports = Member;
