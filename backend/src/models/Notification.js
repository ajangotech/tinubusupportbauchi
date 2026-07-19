const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true, unsigned: true },
  userId: { type: DataTypes.BIGINT, field: 'user_id', unsigned: true },
  title: { type: DataTypes.STRING(255), allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
  type: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'info' },
  readAt: { type: DataTypes.DATE, field: 'read_at' },
}, { tableName: 'notifications', timestamps: true });

module.exports = Notification;
