const path = require('path');
const fs = require('fs');
const multer = require('multer');
const env = require('../config/environment');

const ALLOWED_MIME = {
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  document: ['application/pdf', 'image/jpeg', 'image/png', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
};

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function storageFor(subdir) {
  const dest = path.join(env.dirs.uploads, subdir);
  ensureDir(dest);
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, dest),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${unique}${ext}`);
    },
  });
}

function fileFilter(kind) {
  return (req, file, cb) => {
    const allowed = ALLOWED_MIME[kind] || [];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error(`File type not allowed: ${file.mimetype}`), false);
  };
}

function uploadImage(subdir, limits = { fileSize: 5 * 1024 * 1024 }) {
  return multer({
    storage: storageFor(subdir),
    fileFilter: fileFilter('image'),
    limits,
  });
}

function uploadDocument(subdir, limits = { fileSize: 10 * 1024 * 1024 }) {
  return multer({
    storage: storageFor(subdir),
    fileFilter: fileFilter('document'),
    limits,
  });
}

function publicUrl(subdir, filename) {
  if (!filename) return null;
  return `${env.app.uploadBaseUrl}/${subdir}/${filename}`;
}

module.exports = { uploadImage, uploadDocument, publicUrl };
