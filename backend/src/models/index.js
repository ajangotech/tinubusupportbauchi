const { sequelize } = require('../config/database');
const User = require('./User');
const Member = require('./Member');
const CorporateOrganization = require('./CorporateOrganization');
const BlogCategory = require('./BlogCategory');
const BlogPost = require('./BlogPost');
const Event = require('./Event');
const Leadership = require('./Leadership');
const ContactMessage = require('./ContactMessage');
const NewsletterSubscriber = require('./NewsletterSubscriber');
const Notification = require('./Notification');
const ActivityLog = require('./ActivityLog');

// --- Associations ---
User.hasOne(Member, { foreignKey: 'user_id', as: 'member' });
Member.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasOne(CorporateOrganization, { foreignKey: 'user_id', as: 'corporate' });
CorporateOrganization.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

BlogCategory.hasMany(BlogPost, { foreignKey: 'category_id', as: 'posts' });
BlogPost.belongsTo(BlogCategory, { foreignKey: 'category_id', as: 'category' });

User.hasMany(BlogPost, { foreignKey: 'author_id', as: 'posts' });
BlogPost.belongsTo(User, { foreignKey: 'author_id', as: 'author' });

User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(ActivityLog, { foreignKey: 'user_id', as: 'activityLogs' });
ActivityLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
  sequelize,
  User,
  Member,
  CorporateOrganization,
  BlogCategory,
  BlogPost,
  Event,
  Leadership,
  ContactMessage,
  NewsletterSubscriber,
  Notification,
  ActivityLog,
};
