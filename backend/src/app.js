const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

const env = require('./config/environment');
const logger = require('./config/logger');
const { assertConnection } = require('./config/database');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { apiLimiter } = require('./middleware/rateLimitMiddleware');

const app = express();

// Ensure upload directories exist
['members', 'corporate', 'blog', 'leadership'].forEach((sub) => {
  const dir = path.join(env.dirs.uploads, sub);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Security
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}));
app.use(cors({
  origin: env.clientUrl ? env.clientUrl.split(',') : '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Parsing
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Compression
app.use(compression());

// Logging
app.use(morgan(env.isProd ? 'combined' : 'dev', {
  stream: { write: (msg) => logger.info(msg.trim()) },
}));

// Rate limiting (global)
app.use('/api', apiLimiter);

// Static uploads
app.use('/uploads', express.static(env.dirs.uploads, { maxAge: '7d' }));

// Health check
app.get('/health', (req, res) => res.json({ success: true, status: 'ok', app: env.app.name }));

// API routes
app.use('/api', routes);

// 404 + error handling
app.use(notFound);
app.use(errorHandler);

// Verify DB connection on boot (non-blocking: logs only)
assertConnection().catch((err) => logger.error('DB connection failed on boot:', err.message));

module.exports = app;
