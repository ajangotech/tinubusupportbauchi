const QRCode = require('qrcode');
const env = require('../config/environment');

async function generateQrCodeDataURL(text) {
  return QRCode.toDataURL(text, { errorCorrectionLevel: 'M', width: 240, margin: 1 });
}

async function generateQrCodeBuffer(text) {
  return QRCode.toBuffer(text, { errorCorrectionLevel: 'M', width: 240, margin: 1 });
}

function verificationUrl(membershipNumber) {
  return `${env.app.url}/api/members/verify/${encodeURIComponent(membershipNumber)}`;
}

module.exports = { generateQrCodeDataURL, generateQrCodeBuffer, verificationUrl };
