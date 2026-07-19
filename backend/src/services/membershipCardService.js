const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const env = require('../config/environment');
const { verificationUrl } = require('./qrCodeService');

const CARD_WIDTH = 612;  // US Letter width in pt
const CARD_HEIGHT = 392;
const PRIMARY = '#0b6b3a';
const ACCENT = '#d4af37';
const DARK = '#1f2937';
const MUTED = '#6b7280';

async function buildMembershipCardPdf(member, options = {}) {
  const doc = new PDFDocument({ size: [CARD_WIDTH, CARD_HEIGHT], margin: 0 });
  const buffers = [];
  doc.on('data', (b) => buffers.push(b));

  const finished = new Promise((resolve) => doc.on('end', () => resolve(Buffer.concat(buffers))));

  // Background
  doc.rect(0, 0, CARD_WIDTH, CARD_HEIGHT).fill('#ffffff');
  doc.rect(0, 0, CARD_WIDTH, 12).fill(PRIMARY);
  doc.rect(0, CARD_HEIGHT - 12, CARD_WIDTH, 12).fill(ACCENT);

  // Header
  doc.fillColor(PRIMARY).font('Helvetica-Bold').fontSize(20)
    .text(env.app.name.toUpperCase(), 36, 28, { width: CARD_WIDTH - 72 });
  doc.fillColor(MUTED).font('Helvetica').fontSize(10)
    .text('OFFICIAL MEMBERSHIP CARD', 36, 52, { width: CARD_WIDTH - 72 });

  // Divider
  doc.moveTo(36, 72).lineTo(CARD_WIDTH - 36, 72).strokeColor('#e5e7eb').lineWidth(1).stroke();

  // Photo
  const photoX = 36;
  const photoY = 90;
  const photoSize = 150;
  doc.save();
  doc.roundedRect(photoX, photoY, photoSize, photoSize, 8).clip();
  if (member.passportPhoto && fs.existsSync(localPath(member.passportPhoto))) {
    doc.image(localPath(member.passportPhoto), photoX, photoY, { width: photoSize, height: photoSize });
  } else {
    doc.rect(photoX, photoY, photoSize, photoSize).fill('#f3f4f6');
    doc.fillColor(MUTED).font('Helvetica').fontSize(11)
      .text('No Photo', photoX, photoY + photoSize / 2 - 6, { width: photoSize, align: 'center' });
  }
  doc.restore();
  doc.roundedRect(photoX, photoY, photoSize, photoSize, 8).lineWidth(1).strokeColor('#e5e7eb').stroke();

  // Details
  const detailX = photoX + photoSize + 28;
  const detailY = 90;
  doc.fillColor(DARK).font('Helvetica-Bold').fontSize(18)
    .text(member.fullName ? member.fullName() : `${member.firstName} ${member.lastName}`, detailX, detailY);

  const rows = [
    ['Membership No.', member.membershipNumber],
    ['LGA', member.lga || '-'],
    ['Ward', member.ward || '-'],
    ['Registration Date', member.registrationDate ? new Date(member.registrationDate).toLocaleDateString() : '-'],
    ['Status', member.status ? member.status.toUpperCase() : '-'],
  ];

  let y = detailY + 30;
  doc.font('Helvetica').fontSize(11);
  for (const [label, value] of rows) {
    doc.fillColor(MUTED).text(label, detailX, y);
    doc.fillColor(DARK).font('Helvetica-Bold').text(value, detailX + 120, y);
    doc.font('Helvetica');
    y += 20;
  }

  // QR Code
  const qrUrl = verificationUrl(member.membershipNumber);
  const qrDataUrl = await QRCode.toDataURL(qrUrl, { width: 200, margin: 1 });
  const qrSize = 110;
  doc.image(qrDataUrl, CARD_WIDTH - qrSize - 36, CARD_HEIGHT - qrSize - 28, { width: qrSize, height: qrSize });
  doc.fillColor(MUTED).fontSize(8).text('Scan to verify', CARD_WIDTH - qrSize - 36, CARD_HEIGHT - 24, { width: qrSize, align: 'center' });

  // Footer
  doc.fillColor(MUTED).fontSize(9).text(
    `Issued by ${env.app.name} — ${env.app.url}`,
    36, CARD_HEIGHT - 26, { width: CARD_WIDTH - 72, align: 'left' }
  );

  doc.end();
  return finished;
}

function localPath(storedPath) {
  // stored path may be relative to uploads/ or absolute URL
  if (!storedPath) return '';
  if (fs.existsSync(storedPath)) return storedPath;
  const base = env.dirs.uploads;
  const candidates = [
    path.join(base, path.basename(storedPath)),
    path.join(base, 'members', path.basename(storedPath)),
  ];
  return candidates.find((p) => fs.existsSync(p)) || candidates[0];
}

module.exports = { buildMembershipCardPdf };
