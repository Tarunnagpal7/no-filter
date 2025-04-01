import { ApiResponse } from "@/types/ApiResponse";
import nodemailer from "nodemailer";

// Simple HTML email template function
function createVerificationEmailHTML(username: string, verifyCode: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Email Verification</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f4f4f4; padding: 10px; text-align: center; }
        .content { padding: 20px; }
        .code { font-size: 24px; font-weight: bold; text-align: center; margin: 20px 0; letter-spacing: 5px; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #888; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Email Verification</h1>
        </div>
        <div class="content">
          <p>Hello ${username},</p>
          <p>Thank you for signing up! Please use the verification code below to complete your registration:</p>
          <div class="code">${verifyCode}</div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 Your Service. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export default async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string
) : Promise<ApiResponse> {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Generate HTML email content
    const emailHtml = createVerificationEmailHTML(username, verifyCode);

    // Send the email
     await transporter.sendMail({
      from: `NO-FILTER <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Welcome to Our Service!",
      html: emailHtml,
    });

    return {
      success: true,
      message: "Verification email sent successfully",
    };
  } catch (error) {
    console.error("Email Verification Error : ", error);
    return {
      success: false,
      message: "Failed to send verification email",
    };
  }
}