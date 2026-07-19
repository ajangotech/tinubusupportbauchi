const Joi = require('joi');

const registerSchema = Joi.object({
  userId: Joi.number().integer().positive().allow(null),
  organizationName: Joi.string().min(2).max(190).required(),
  organizationType: Joi.string().max(120).allow('', null),
  registrationNumber: Joi.string().max(80).allow('', null),
  contactPerson: Joi.string().max(150).required(),
  phone: Joi.string().max(30).required(),
  email: Joi.string().email().max(190).required(),
  state: Joi.string().max(80).required(),
  lga: Joi.string().max(80).allow('', null),
  officeAddress: Joi.string().max(255).allow('', null),
  website: Joi.string().max(190).allow('', null),
  supportArea: Joi.string().max(255).allow('', null),
});

const updateProfileSchema = Joi.object({
  organizationName: Joi.string().min(2).max(190),
  organizationType: Joi.string().max(120).allow('', null),
  registrationNumber: Joi.string().max(80).allow('', null),
  contactPerson: Joi.string().max(150),
  phone: Joi.string().max(30),
  email: Joi.string().email().max(190),
  state: Joi.string().max(80),
  lga: Joi.string().max(80).allow('', null),
  officeAddress: Joi.string().max(255).allow('', null),
  website: Joi.string().max(190).allow('', null),
  supportArea: Joi.string().max(255).allow('', null),
});

const rejectSchema = Joi.object({
  reason: Joi.string().max(255).required(),
});

module.exports = { registerSchema, updateProfileSchema, rejectSchema };
