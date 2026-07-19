require('dotenv').config();
const { sequelize } = require('../src/models');

(async () => {
  try {
    await sequelize.authenticate();
    // Creates tables only if they do not exist. Use { force: true } to drop & recreate (destructive).
    await sequelize.sync();
    console.log('Database sync complete.');
    process.exit(0);
  } catch (err) {
    console.error('Database sync failed:', err);
    process.exit(1);
  }
})();
