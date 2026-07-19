const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const env = require('../config/environment');

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const PRIMARY = '#0b6b3a';
const ACCENT = '#d4af37';
const DARK = '#1f2937';
const MUTED = '#6b7280';

async function buildCorporateCertificatePdf(org, options = {}) {
  const doc = new PDFDocument({ size: [PAGE_WIDTH, PAGE_HEIGHT], margin: 48 });
  const buffers = [];
  doc.on('data', (b) => buffers.push(b));
  const finished = new Promise((resolve) => doc.on('end', () => resolve(Buffer.concat(buffers))));

  // Border frame
  doc.rect(24, 24, PAGE_WIDTH - 48, PAGE_HEIGHT - 48).lineWidth(2).strokeColor(PRIMARY).stroke();
  doc.rect(34, 34, PAGE_WIDTH - 68, PAGE_HEIGHT - 68).lineWidth(1).strokeColor(ACCENT).stroke();

  // Header
  doc.fillColor(PRIMARY).font('Helvetica-Bold').fontSize(22)
    .text(env.app.name.toUpperCase(), { align: 'center' });
  doc.fillColor(MUTED).font('Helvetica').fontSize(11)
    .text('CORPORATE REGISTRATION CERTIFICATE', { align: 'center' });
  doc.moveDown(2);

  // Title
  doc.fillColor(DARK).font('Helvetica-Bold').fontSize(28)
    .text('Certificate of Registration', { align: 'center' });
  doc.moveDown(1.5);

  // Body
  doc.font('Helvetica').fontSize(13).fillColor(DARK);
  doc.text('This is to certify that the organization named below has been duly registered with', { align: 'center' });
  doc.text(`${env.app.name}.`, { align: 'center' });
  doc.moveDown(2);

  const fields = [
    ['Organization Name', org.organizationName],
    ['Registration Number', org.corporateNumber],
    ['Organization Type', org.organizationType || '-'],
    ['Contact Person', org.contactPerson || '-'],
    ['State / LGA', [org.state, org.lga].filter(Boolean).join(' / ') || '-'],
    ['Support Area', org.supportArea || '-'],
    ['Date Approved', org.approvedAt ? new Date(org.approvedAt).toLocaleDateString() : '-'],
  ];

  const startY = doc.y;
  const labelX = 130;
  const valueX = 320;
  let y = startY;
  for (const [label, value] of fields) {
    doc.font('Helvetica-Bold').fillColor(MUTED).fontSize(11).text(label, labelX, y);
    doc.font('Helvetica').fillColor(DARK).fontSize(12).text(String(value || '-'), valueX, y);
    y += 22;
  }

  doc.moveDown(3);
  // Signature line
  doc.moveTo(120, 660).lineTo(280, 660).strokeColor(DARK).lineWidth(1).stroke();
  doc.font('Helvetica').fontSize(10).fillColor(MUTED).text('Membership Officer', 120, 666, { width: 160, align: 'center' });

  doc.moveTo(PAGE_WIDTH - 280, 660).lineTo(PAGE_WIDTH - 120, 660).strokeColor(DARK).lineWidth(1).stroke();
  doc.text('Date', PAGE_WIDTH - 280, 666, { width: 160, align: 'center' });

  // Logo (if available)
  if (org.organizationLogo && fs.existsSync(localPath(org.organizationLogo))) {
    doc.image(localPath(org.organizationLogo), PAGE_WIDTH - 120, 60, { width: 80, height: 80 });
  }

  // Footer
  doc.fillColor(MUTED).fontSize(9).text(
    `${env.app.url} — This certificate can be verified via the corporate registration number above.`,
    48, PAGE_HEIGHT - 60, { width: PAGE_WIDTH - 96, align: 'center' }
  );

  doc.end();
  return finished;
}

function localPath(storedPath) {
  if (!storedPath) return '';
  if (fs.existsSync(storedPath)) return storedPath;
  const base = env.dirs.uploads;
  const candidates = [
    path.join(base, path.basename(storedPath)),
    path.join(base, 'corporate', path.basename(storedPath)),
  ];
  return candidates.find((p) => fs.existsSync(p)) || candidates[0];
}

module.exports = { buildCorporateCertificatePdf };
