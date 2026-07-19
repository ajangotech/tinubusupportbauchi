const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(150).required(),
  email: Joi.string().email().max(190).required(),
  phone: Joi.string().max(30).allow('', null),
  password: Joi.string().min(8).max(128).required(),
  role: Joi.string().valid('member', 'corporate_user').default('member'),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(8).max(128).required(),
});

const updateMeSchema = Joi.object({
  name: Joi.string().min(2).max(150),
  phone: Joi.string().max(30).allow('', null),
  password: Joi.string().min(8).max(128),
});

module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateMeSchema,
};
