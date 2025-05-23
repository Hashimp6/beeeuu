const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Store in .env
    pass: process.env.APP_PASS, // Use App Password
  },
});

// Function to send OTP email
const sendMail = async (to, otp) => {
  return await transporter.sendMail({
    from: '"BueBee" buebee@gmail.com', // Replace with your brand name
    to: to,
    subject: "OTP Verification",
    text: `Your one-time password (OTP) is: ${otp}`,
    html: `<h2>Your OTP: <b>${otp}</b></h2><p>This OTP is valid for 5 minutes.</p>`,
  });
};

module.exports = sendMail;