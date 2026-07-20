import nodemailer from "nodemailer";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Create a transporter using Gmail service
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Define the interface for the email options
interface SendEmailOptions {
  to: string;
  replyTo?: string;
  subject: string;
  html: string;
}

// Function to send an email
export const sendEmail = async ({
  to,
  subject,
  html,
}: SendEmailOptions): Promise<void> => {
  await transporter.sendMail({
    from: {
      name: "NovaStyle",
      address: process.env.ADMIN_EMAIL!,
    },
    to,
    subject,
    html,
  });
};