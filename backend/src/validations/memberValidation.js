const Joi = require('joi');

const registerSchema = Joi.object({
  // Optional linked user account
  userId: Joi.number().integer().positive().allow(null),

  firstName: Joi.string().min(2).max(80).required(),
  middleName: Joi.string().max(80).allow('', null),
  lastName: Joi.string().min(2).max(80).required(),
  gender: Joi.string().valid('male', 'female', 'other').allow('', null),
  dateOfBirth: Joi.date().less('now').allow(null),
  phone: Joi.string().max(30).required(),
  email: Joi.string().email().max(190).allow('', null),
  nin: Joi.string().max(20).allow('', null),
  occupation: Joi.string().max(150).allow('', null),
  state: Joi.string().max(80).required(),
  lga: Joi.string().max(80).required(),
  ward: Joi.string().max(80).allow('', null),
  pollingUnit: Joi.string().max(120).allow('', null),
  address: Joi.string().max(255).allow('', null),
  registrationDate: Joi.date().optional(),
});

const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(2).max(80),
  middleName: Joi.string().max(80).allow('', null),
  lastName: Joi.string().min(2).max(80),
  gender: Joi.string().valid('male', 'female', 'other').allow('', null),
  dateOfBirth: Joi.date().less('now').allow(null),
  phone: Joi.string().max(30),
  email: Joi.string().email().max(190).allow('', null),
  nin: Joi.string().max(20).allow('', null),
  occupation: Joi.string().max(150).allow('', null),
  state: Joi.string().max(80),
  lga: Joi.string().max(80),
  ward: Joi.string().max(80).allow('', null),
  pollingUnit: Joi.string().max(120).allow('', null),
  address: Joi.string().max(255).allow('', null),
});

const rejectSchema = Joi.object({
  reason: Joi.string().max(255).required(),
});

module.exports = { registerSchema, updateProfileSchema, rejectSchema };
