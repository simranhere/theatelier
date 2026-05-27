const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function sendEmail(to, subject, html) {
  return transporter.sendMail({
    from: `"Atelier" <${process.env.EMAIL_USER}>`,
    to: to,
    subject: subject,
    html: html,
  });
}

module.exports = sendEmail;
