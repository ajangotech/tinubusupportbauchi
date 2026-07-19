const env = require('./environment');
const logger = require('./logger');

const transporter = env.smtp.host
  ? require('nodemailer').createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: { user: env.smtp.user, pass: env.smtp.pass },
    })
  : null;

async function sendMail({ to, subject, html, text }) {
  if (!transporter) {
    logger.warn(`SMTP not configured; skipping email to ${to} (subject: ${subject})`);
    logger.debug(text || html);
    return { skipped: true };
  }
  const info = await transporter.sendMail({
    from: env.smtp.from,
    to,
    subject,
    html,
    text: text || html,
  });
  return info;
}

module.exports = { sendMail };
