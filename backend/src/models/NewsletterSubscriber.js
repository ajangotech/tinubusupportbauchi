const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const NewsletterSubscriber = sequelize.define('NewsletterSubscriber', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true, unsigned: true },
  email: { type: DataTypes.STRING(190), allowNull: false, unique: true, validate: { isEmail: true } },
  status: {
    type: DataTypes.ENUM('subscribed', 'unsubscribed'),
    allowNull: false, defaultValue: 'subscribed',
  },
  token: { type: DataTypes.STRING(64), allowNull: false },
}, { tableName: 'newsletter_subscribers', timestamps: true });

module.exports = NewsletterSubscriber;
