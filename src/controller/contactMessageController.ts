import ContactMessage from "../models/contactMessage.js";
import { Request, Response } from "express";
import { validationResult } from "express-validator";
import brevo from "../utils/brevo.js";

// Controller function to handle contact message submission
export const submitContactMessage = async (req: Request, res: Response) => {
  // Validate the request body using express-validator
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Extract the contact message details from the request body
    const { name, email, subject, message } = req.body;

    // Create a new contact message document and save it to the database
    const newMessage = new ContactMessage({ name, email, subject, message });
    await newMessage.save();

    // Send the message to the admin email
    try {
      await brevo.transactionalEmails.sendTransacEmail({
        to: [
          {
            email: process.env.ADMIN_EMAIL || "",
          },
        ],
        sender: {
          email: process.env.ADMIN_EMAIL!,
          name: "NovaStyle Contact Form",
        },
        replyTo: email,
        subject: `New Contact Message: ${subject}`,
        htmlContent: `
            <h2>New Contact Message</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong><br>${message}</p>
        `,
      });

      // Respond with a success message if the email is sent successfully
      res.status(201).json({ message: "Message submitted successfully" });
    } catch (emailError) {
      // Respond with a server error message if the email fails to send
      res
        .status(500)
        .json({ message: "Message saved but failed to send email" });
    }
  } catch (error) {
    // Respond with a server error message if an exception occurs
    res.status(500).json({ message: "Server error", error });
  }
};
