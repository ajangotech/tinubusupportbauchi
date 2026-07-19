const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BlogPost = sequelize.define('BlogPost', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true, unsigned: true },
  categoryId: { type: DataTypes.BIGINT, field: 'category_id', unsigned: true },
  authorId: { type: DataTypes.BIGINT, field: 'author_id', unsigned: true },
  title: { type: DataTypes.STRING(255), allowNull: false },
  slug: { type: DataTypes.STRING(255), allowNull: false, unique: true },
  excerpt: { type: DataTypes.STRING(500) },
  content: { type: DataTypes.TEXT('long') },
  featuredImage: { type: DataTypes.STRING(255), field: 'featured_image' },
  tags: { type: DataTypes.JSON, defaultValue: [] },
  metaTitle: { type: DataTypes.STRING(255), field: 'meta_title' },
  metaDescription: { type: DataTypes.STRING(500), field: 'meta_description' },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'archived'),
    allowNull: false, defaultValue: 'draft',
  },
  publishedAt: { type: DataTypes.DATE, field: 'published_at' },
}, {
  tableName: 'blog_posts',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = BlogPost;
