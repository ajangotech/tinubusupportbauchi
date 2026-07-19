const { sendMail } = require('../config/mail');
const env = require('../config/environment');

function wrapHtml(title, body) {
  return `<!doctype html><html><body style="font-family:Arial,Helvetica,sans-serif;background:#f4f4f5;margin:0;padding:24px;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:8px;padding:24px;">
    <h2 style="color:#0b6b3a;margin-top:0;">${env.app.name}</h2>
    <h3 style="margin-top:0;">${title}</h3>
    ${body}
    <hr style="margin:24px 0;border:none;border-top:1px solid #eee;">
    <p style="font-size:12px;color:#666;">${env.app.url}</p>
  </div></body></html>`;
}

async function sendWelcome({ to, name }) {
  const subject = `Welcome to ${env.app.name}`;
  const html = wrapHtml('Welcome', `<p>Hi ${name},</p><p>Your account has been created. We are glad to have you on board.</p>`);
  return sendMail({ to, subject, html, text: `Hi ${name}, welcome to ${env.app.name}.` });
}

async function sendMemberApproved({ to, name, membershipNumber }) {
  const subject = 'Your membership has been approved';
  const html = wrapHtml('Membership Approved',
    `<p>Hi ${name},</p><p>Your membership has been approved. Your membership number is <strong>${membershipNumber}</strong>.</p>
     <p>You can now download your membership card from your dashboard.</p>`);
  return sendMail({ to, subject, html, text: `Hi ${name}, your membership (${membershipNumber}) was approved.` });
}

async function sendMemberRejected({ to, name, reason }) {
  const subject = 'Your membership application was rejected';
  const html = wrapHtml('Membership Update',
    `<p>Hi ${name},</p><p>Unfortunately your membership application was rejected.</p>
     ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}`);
  return sendMail({ to, subject, html, text: `Hi ${name}, your membership application was rejected.` });
}

async function sendCorporateApproved({ to, name, corporateNumber }) {
  const subject = 'Your corporate registration has been approved';
  const html = wrapHtml('Corporate Registration Approved',
    `<p>Hi ${name},</p><p>Your corporate registration has been approved. Your registration number is <strong>${corporateNumber}</strong>.</p>`);
  return sendMail({ to, subject, html, text: `Hi ${name}, your corporate registration (${corporateNumber}) was approved.` });
}

async function sendCorporateRejected({ to, name, reason }) {
  const subject = 'Your corporate registration was rejected';
  const html = wrapHtml('Corporate Registration Update',
    `<p>Hi ${name},</p><p>Your corporate registration was rejected.</p>
     ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}`);
  return sendMail({ to, subject, html, text: `Hi ${name}, your corporate registration was rejected.` });
}

async function sendPasswordReset({ to, name, resetUrl }) {
  const subject = 'Password reset request';
  const html = wrapHtml('Password Reset',
    `<p>Hi ${name},</p><p>We received a request to reset your password. Click the link below to choose a new password. This link expires in 1 hour.</p>
     <p><a href="${resetUrl}" style="background:#0b6b3a;color:#fff;padding:10px 18px;border-radius:4px;text-decoration:none;">Reset password</a></p>
     <p>If you did not request this, you can ignore this email.</p>`);
  return sendMail({ to, subject, html, text: `Reset your password: ${resetUrl}` });
}

async function sendContactAcknowledgement({ to, name }) {
  const subject = 'We received your message';
  const html = wrapHtml('Message Received',
    `<p>Hi ${name},</p><p>Thank you for contacting ${env.app.name}. Our team will get back to you shortly.</p>`);
  return sendMail({ to, subject, html, text: `Hi ${name}, thanks for reaching out.` });
}

module.exports = {
  sendMail,
  sendWelcome,
  sendMemberApproved,
  sendMemberRejected,
  sendCorporateApproved,
  sendCorporateRejected,
  sendPasswordReset,
  sendContactAcknowledgement,
};
