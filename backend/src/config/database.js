const { Sequelize } = require('sequelize');
const env = require('./environment');
const logger = require('./logger');

const sequelize = new Sequelize(env.db.name, env.db.user, env.db.password, {
  host: env.db.host,
  port: env.db.port,
  dialect: 'mysql',
  logging: env.isDev ? (msg) => logger.debug(msg) : false,
  define: {
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

async function assertConnection() {
  try {
    await sequelize.authenticate();
    logger.info('MySQL connection established successfully.');
  } catch (err) {
    logger.error('Unable to connect to MySQL:', err.message);
    throw err;
  }
}

module.exports = { sequelize, assertConnection };
