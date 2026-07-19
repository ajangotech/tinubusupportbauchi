const path = require('path');

function required(key, fallback = undefined) {
  const v = process.env[key];
  if (v === undefined || v === '') {
    if (fallback !== undefined) return fallback;
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return v;
}

function int(key, fallback) {
  const v = process.env[key];
  if (v === undefined || v === '') return fallback;
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? fallback : n;
}

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProd: process.env.NODE_ENV === 'production',
  isDev: process.env.NODE_ENV !== 'production',
  port: int('PORT', 5000),
  clientUrl: required('CLIENT_URL', 'http://localhost:3000'),

  db: {
    host: required('DB_HOST', 'localhost'),
    port: int('DB_PORT', 3306),
    user: required('DB_USER', 'root'),
    password: process.env.DB_PASSWORD || '',
    name: required('DB_NAME', 'tinubu_support_bauchi_2027'),
  },

  jwt: {
    secret: required('JWT_SECRET', 'dev_secret_change_me'),
    expiresIn: required('JWT_EXPIRES_IN', '1d'),
    refreshSecret: required('JWT_REFRESH_SECRET', 'dev_refresh_secret_change_me'),
    refreshExpiresIn: required('JWT_REFRESH_EXPIRES_IN', '7d'),
  },

  bcrypt: {
    saltRounds: int('BCRYPT_SALT_ROUNDS', 10),
  },

  smtp: {
    host: process.env.SMTP_HOST || '',
    port: int('SMTP_PORT', 587),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'no-reply@tinubusupportbauchi2027.org',
  },

  app: {
    name: required('APP_NAME', 'Tinubu Support Bauchi 2027'),
    url: required('APP_URL', 'http://localhost:5000'),
    uploadBaseUrl: required('UPLOAD_BASE_URL', 'http://localhost:5000/uploads'),
  },

  rateLimit: {
    windowMs: int('RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000),
    max: int('RATE_LIMIT_MAX', 300),
    authMax: int('AUTH_RATE_LIMIT_MAX', 10),
  },

  dirs: {
    root: path.resolve(__dirname, '..', '..'),
    uploads: path.resolve(__dirname, '..', '..', 'uploads'),
    public: path.resolve(__dirname, '..', '..', 'public'),
  },

  roles: [
    'super_admin',
    'admin',
    'membership_officer',
    'corporate_officer',
    'editor',
    'member',
    'corporate_user',
  ],
};

module.exports = env;
