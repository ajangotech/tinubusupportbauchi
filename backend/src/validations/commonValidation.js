const Joi = require('joi');

const messageStatusSchema = Joi.object({
  status: Joi.string().valid('new', 'read', 'replied', 'archived').required(),
});

const blogCategorySchema = Joi.object({
  name: Joi.string().min(2).max(120).required(),
  slug: Joi.string().min(2).max(160).required(),
  description: Joi.string().allow('', null),
});

const blogPostSchema = Joi.object({
  categoryId: Joi.number().integer().positive().allow(null),
  title: Joi.string().min(3).max(255).required(),
  slug: Joi.string().min(3).max(255).required(),
  excerpt: Joi.string().max(500).allow('', null),
  content: Joi.string().allow('', null),
  featuredImage: Joi.string().max(255).allow('', null),
  tags: Joi.array().items(Joi.string().max(60)).default([]),
  metaTitle: Joi.string().max(255).allow('', null),
  metaDescription: Joi.string().max(500).allow('', null),
  status: Joi.string().valid('draft', 'published', 'archived').default('draft'),
  publishedAt: Joi.date().allow(null),
});

const eventSchema = Joi.object({
  title: Joi.string().min(3).max(255).required(),
  slug: Joi.string().min(3).max(255).required(),
  description: Joi.string().allow('', null),
  eventDate: Joi.date().required(),
  eventTime: Joi.string().allow('', null),
  location: Joi.string().max(255).allow('', null),
  featuredImage: Joi.string().max(255).allow('', null),
  status: Joi.string().valid('upcoming', 'ongoing', 'completed', 'cancelled').default('upcoming'),
});

const leadershipSchema = Joi.object({
  name: Joi.string().min(2).max(150).required(),
  position: Joi.string().min(2).max(150).required(),
  biography: Joi.string().allow('', null),
  photo: Joi.string().max(255).allow('', null),
  socialLinks: Joi.object().default({}),
  status: Joi.string().valid('active', 'inactive').default('active'),
});

const contactSchema = Joi.object({
  name: Joi.string().min(2).max(150).required(),
  email: Joi.string().email().max(190).required(),
  phone: Joi.string().max(30).allow('', null),
  subject: Joi.string().max(255).allow('', null),
  message: Joi.string().min(5).max(5000).required(),
});

const newsletterSchema = Joi.object({
  email: Joi.string().email().required(),
});

const notificationSchema = Joi.object({
  userId: Joi.number().integer().positive().allow(null),
  title: Joi.string().max(255).required(),
  message: Joi.string().max(2000).required(),
  type: Joi.string().max(50).default('info'),
});

module.exports = {
  blogCategorySchema,
  blogPostSchema,
  eventSchema,
  leadershipSchema,
  contactSchema,
  newsletterSchema,
  notificationSchema,
  messageStatusSchema,
};
