const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcrypt');
const env = require('../config/environment');

const User = sequelize.define('User', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true, unsigned: true },
  name: { type: DataTypes.STRING(150), allowNull: false },
  email: { type: DataTypes.STRING(190), allowNull: false, unique: true, validate: { isEmail: true } },
  phone: { type: DataTypes.STRING(30) },
  password: { type: DataTypes.STRING(255), allowNull: false },
  role: {
    type: DataTypes.ENUM('super_admin', 'admin', 'membership_officer', 'corporate_officer', 'editor', 'member', 'corporate_user'),
    allowNull: false, defaultValue: 'member',
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'suspended'),
    allowNull: false, defaultValue: 'active',
  },
  resetToken: { type: DataTypes.STRING(255), field: 'reset_token' },
  resetExpiresAt: { type: DataTypes.DATE, field: 'reset_expires_at' },
  lastLoginAt: { type: DataTypes.DATE, field: 'last_login_at' },
}, { tableName: 'users', timestamps: true });

User.addHook('beforeSave', async (user) => {
  if (user.changed('password')) {
    user.password = await bcrypt.hash(user.password, env.bcrypt.saltRounds);
  }
});

User.prototype.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

User.prototype.toJSON = function () {
  const values = { ...this.get() };
  delete values.password;
  delete values.resetToken;
  delete values.resetExpiresAt;
  return values;
};

module.exports = User;
