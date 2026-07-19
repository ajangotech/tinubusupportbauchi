require('dotenv').config();
const bcrypt = require('bcrypt');
const { sequelize, User, BlogCategory } = require('../src/models');

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    const existing = await User.findOne({ where: { email: 'admin@tinubusupportbauchi2027.org' } });
    if (!existing) {
      await User.create({
        name: 'Super Admin',
        email: 'admin@tinubusupportbauchi2027.org',
        password: 'Admin@2027',
        role: 'super_admin',
        status: 'active',
      });
      console.log('Created default super admin: admin@tinubusupportbauchi2027.org / Admin@2027');
    } else {
      console.log('Super admin already exists.');
    }

    const categories = ['News', 'Events', 'Policy', 'Community', 'Announcements'];
    for (const name of categories) {
      const slug = name.toLowerCase();
      await BlogCategory.findOrCreate({ where: { slug }, defaults: { name, slug } });
    }
    console.log('Default blog categories ensured.');

    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
})();
