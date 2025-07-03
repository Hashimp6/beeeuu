// Enhanced nodeMailer.js configuration
const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Store in .env
    pass: process.env.APP_PASS, // Use App Password
  },
});

// Email templates
const emailTemplates = {
  // OTP Verification Template
  otpVerification: (otp) => ({
    subject: "OTP Verification - BueBee",
    text: `Your one-time password (OTP) is: ${otp}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #4CAF50; margin: 0;">BueBee</h1>
            <p style="color: #666; margin: 5px 0;">Your trusted platform</p>
          </div>
          
          <h2 style="color: #333; text-align: center; margin-bottom: 20px;">Email Verification</h2>
          
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            Thank you for registering with BueBee! Please use the following OTP to verify your email address:
          </p>
          
          <div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; text-align: center; margin: 25px 0;">
            <h1 style="color: #4CAF50; font-size: 36px; margin: 0; letter-spacing: 5px;">${otp}</h1>
          </div>
          
          <p style="color: #666; font-size: 14px; text-align: center;">
            <strong>This OTP will expire in 30 minutes.</strong>
          </p>
          
          <div style="border-top: 1px solid #eee; margin-top: 30px; padding-top: 20px;">
            <p style="color: #999; font-size: 12px; text-align: center;">
              If you didn't request this verification, please ignore this email.
            </p>
          </div>
        </div>
      </div>
    `
  }),

  // Password Reset Template
  passwordReset: (resetLink, username) => ({
    subject: "Password Reset Request - SerchBy",
    text: `Hello ${username}, you have requested to reset your password. Click this link: ${resetLink}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #4CAF50; margin: 0;">BueBee</h1>
            <p style="color: #666; margin: 5px 0;">Your trusted platform</p>
          </div>
          
          <h2 style="color: #333; text-align: center; margin-bottom: 20px;">Password Reset Request</h2>
          
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            Hello <strong>${username}</strong>,
          </p>
          
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            You have requested to reset your password for your BueBee account. Click the button below to create a new password:
          </p>
          
          <div style="text-align: center; margin: 35px 0;">
            <a href="${resetLink}" 
               style="background-color: #4CAF50; color: white; padding: 15px 30px; 
                      text-decoration: none; border-radius: 8px; display: inline-block;
                      font-weight: bold; font-size: 16px;">
              Reset Password
            </a>
          </div>
          
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 25px 0;">
            <p style="color: #856404; margin: 0; font-size: 14px;">
              <strong>⚠️ Security Notice:</strong> This link will expire in 30 minutes for your security.
            </p>
          </div>
          
          <p style="color: #666; font-size: 14px; line-height: 1.5;">
            If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
          </p>
          
          <div style="border-top: 1px solid #eee; margin-top: 30px; padding-top: 20px;">
            <p style="color: #999; font-size: 12px; text-align: center;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${resetLink}" style="color: #4CAF50; word-break: break-all;">${resetLink}</a>
            </p>
          </div>
        </div>
      </div>
    `
  }),

  // Password Reset Confirmation Template
  passwordResetConfirmation: (username) => ({
    subject: "Password Successfully Reset - BueBee",
    text: `Hello ${username}, your password has been successfully reset.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #4CAF50; margin: 0;">BueBee</h1>
            <p style="color: #666; margin: 5px 0;">Your trusted platform</p>
          </div>
          
          <div style="text-align: center; margin-bottom: 25px;">
            <div style="width: 60px; height: 60px; background-color: #4CAF50; border-radius: 50%; 
                        display: inline-flex; align-items: center; justify-content: center;">
              <span style="color: white; font-size: 24px;">✓</span>
            </div>
          </div>
          
          <h2 style="color: #28a745; text-align: center; margin-bottom: 20px;">Password Reset Successful</h2>
          
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            Hello <strong>${username}</strong>,
          </p>
          
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            Your password has been successfully reset. You can now log in to your BueBee account with your new password.
          </p>
          
          <div style="background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 5px; padding: 15px; margin: 25px 0;">
            <p style="color: #721c24; margin: 0; font-size: 14px;">
              <strong>🔒 Security Alert:</strong> If you didn't make this change, please contact our support team immediately.
            </p>
          </div>
          
          <div style="border-top: 1px solid #eee; margin-top: 30px; padding-top: 20px;">
            <p style="color: #999; font-size: 12px; text-align: center;">
              Need help? Contact us at support@buebee.com
            </p>
          </div>
        </div>
      </div>
    `
  })
};

// Main sendMail function - backwards compatible with your existing code
const sendMail = async (to, otp) => {
  try {
    const template = emailTemplates.otpVerification(otp);
    
    const mailOptions = {
      from: '"Serchby" <serchby@gmail.com>',
      to: to,
      subject: template.subject,
      text: template.text,
      html: template.html,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('OTP Email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw error;
  }
};

// New function for password reset emails
const sendPasswordResetEmail = async (to, resetLink, username) => {
  try {
    console.log("reset ",resetLink);
    
    const template = emailTemplates.passwordReset(resetLink, username);
    
    const mailOptions = {
      from: '"SerchBy" <serchby@gmail.com>',
      to: to,
      subject: template.subject,
      text: template.text,
      html: template.html,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

// New function for password reset confirmation emails
const sendPasswordResetConfirmation = async (to, username) => {
  try {
    const template = emailTemplates.passwordResetConfirmation(username);
    
    const mailOptions = {
      from: '"SerchBy" <serchby@gmail.com>',
      to: to,
      subject: template.subject,
      text: template.text,
      html: template.html,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Password reset confirmation sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending password reset confirmation:', error);
    throw error;
  }
};

// Export functions
module.exports = {
  sendMail, // Keep original function for backwards compatibility
  sendPasswordResetEmail,
  sendPasswordResetConfirmation,
  emailTemplates // Export templates if you want to use them elsewhere
};