const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ActivityLog = sequelize.define('ActivityLog', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true, unsigned: true },
  userId: { type: DataTypes.BIGINT, field: 'user_id', unsigned: true },
  action: { type: DataTypes.STRING(120), allowNull: false },
  description: { type: DataTypes.TEXT },
  ipAddress: { type: DataTypes.STRING(45), field: 'ip_address' },
}, { tableName: 'activity_logs', timestamps: true, updatedAt: false });

module.exports = ActivityLog;
