const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Leadership = sequelize.define('Leadership', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true, unsigned: true },
  name: { type: DataTypes.STRING(150), allowNull: false },
  position: { type: DataTypes.STRING(150), allowNull: false },
  biography: { type: DataTypes.TEXT },
  photo: { type: DataTypes.STRING(255) },
  socialLinks: { type: DataTypes.JSON, field: 'social_links', defaultValue: {} },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    allowNull: false, defaultValue: 'active',
  },
}, { tableName: 'leadership', timestamps: true });

module.exports = Leadership;
