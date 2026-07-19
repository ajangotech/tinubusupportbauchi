const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ContactMessage = sequelize.define('ContactMessage', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true, unsigned: true },
  name: { type: DataTypes.STRING(150), allowNull: false },
  email: { type: DataTypes.STRING(190), allowNull: false, validate: { isEmail: true } },
  phone: { type: DataTypes.STRING(30) },
  subject: { type: DataTypes.STRING(255) },
  message: { type: DataTypes.TEXT, allowNull: false },
  status: {
    type: DataTypes.ENUM('new', 'read', 'replied', 'archived'),
    allowNull: false, defaultValue: 'new',
  },
}, { tableName: 'contact_messages', timestamps: true });

module.exports = ContactMessage;
