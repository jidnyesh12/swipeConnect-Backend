const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT), // 👈 FIXED
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, templateName, placeholders = {}) => {
  const templatePath = path.join(
    __dirname,
    "../templates",
    `${templateName}.html`
  );
  let html = fs.readFileSync(templatePath, "utf-8");

  for (const key in placeholders) {
    const regex = new RegExp(`{${key}}`, "g");
    html = html.replace(regex, placeholders[key]);
  }

  try {
    const info = await transporter.sendMail({
      from: `"DevTinder Support" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log("📧 Email sent:", info.messageId);
    return info;
  } catch (err) {
    console.error("❌ Email error:", err);
    throw err;
  }
};

module.exports = sendEmail;
