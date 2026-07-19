const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Event = sequelize.define('Event', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true, unsigned: true },
  title: { type: DataTypes.STRING(255), allowNull: false },
  slug: { type: DataTypes.STRING(255), allowNull: false, unique: true },
  description: { type: DataTypes.TEXT('long') },
  eventDate: { type: DataTypes.DATEONLY, field: 'event_date', allowNull: false },
  eventTime: { type: DataTypes.TIME, field: 'event_time' },
  location: { type: DataTypes.STRING(255) },
  featuredImage: { type: DataTypes.STRING(255), field: 'featured_image' },
  status: {
    type: DataTypes.ENUM('upcoming', 'ongoing', 'completed', 'cancelled'),
    allowNull: false, defaultValue: 'upcoming',
  },
}, { tableName: 'events', timestamps: true });

module.exports = Event;
