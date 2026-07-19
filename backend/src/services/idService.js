const crypto = require('crypto');

/**
 * Generate a unique membership / corporate number.
 * Format: TSB-YY-XXXXXX (year + 6 random base36 chars, uppercased)
 */
function generateNumber(prefix = 'TSB') {
  const year = new Date().getFullYear().toString().slice(-2);
  const rand = crypto.randomBytes(4).toString('hex').toUpperCase().slice(0, 6);
  return `${prefix}-${year}-${rand}`;
}

function generateMembershipNumber() {
  return generateNumber('TSB');
}

function generateCorporateNumber() {
  return generateNumber('CRP');
}

function generateToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}

module.exports = { generateMembershipNumber, generateCorporateNumber, generateToken };
