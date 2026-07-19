const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BlogCategory = sequelize.define('BlogCategory', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true, unsigned: true },
  name: { type: DataTypes.STRING(120), allowNull: false },
  slug: { type: DataTypes.STRING(160), allowNull: false, unique: true },
  description: { type: DataTypes.TEXT },
}, { tableName: 'blog_categories', timestamps: true });

module.exports = BlogCategory;
