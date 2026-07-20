import Newsletter from "../models/newsletter.js";
import { validationResult } from "express-validator";
import { sendEmail } from "../utils/sendEmail.js";
import { Request, Response } from "express";
import { console } from "inspector/promises";

// Newsletter Controller

// Subscribe to Newsletter
export const subscribeNewsletter = async (
  req: Request,
  res: Response,
): Promise<void> => {
  // Validate the request body
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { email } = req.body;

  // Check if the email is already subscribed
  try {
    const existingSubscriber = await Newsletter.findOne({ email });
    if (existingSubscriber) {
      res.status(400).json({ message: "Email is already subscribed" });
      return;
    }

    // Create a new subscriber
    const newSubscriber = new Newsletter({ email });
    await newSubscriber.save();

    // Send a welcome email
    try {
      await sendEmail({
        to: email,
        subject: "Welcome to NovaStyle Newsletter",
        html: "<p>Thank you for subscribing to our newsletter!</p>",
      });
    } catch (emailError) {
      console.error("Error sending welcome email:", emailError);
    }
    // Respond with success message
    res
      .status(201)
      .json({ message: "Successfully subscribed to the newsletter" });
  } catch (error) {
    console.error("Error subscribing to newsletter:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Unsubscribe from Newsletter
export const unsubscribe = async (
  req: Request,
  res: Response,
): Promise<void> => {
  // Validate the request parameters
  try {
    const { email } = req.params;
    if (!email) {
      res.status(400).json({ message: "Email is required" });
      return;
    }

    // Delete the subscriber
    const subscriber = await Newsletter.findOneAndDelete({ email });

    // Check if the subscriber was found and deleted
    if (!subscriber) {
      res.status(404).json({
        message: "Subscriber not found",
      });
      return;
    }

    // Respond with success message
    res.status(200).json({
      message: "Unsubscribed successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error,
    });
  }
};

// Send Newsletter
export const sendNewsletter = async (
  req: Request,
  res: Response,
): Promise<void> => {
  // Validate the request body
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    // Extract subject and content from the request body
    const { subject, content } = req.body;

    // Fetch all subscribers from the database
    const subscribers = await Newsletter.find();

    // Check if there are any subscribers
    if (subscribers.length === 0) {
      res.status(404).json({ message: "No subscribers found" });
      return;
    }

    // Send the newsletter to each subscriber
    for (const subscriber of subscribers) {
      await sendEmail({
        to: subscriber.email,
        subject,
        html: `<p>${content}</p>`,
      });
    }

    // Respond with success message
    res.status(200).json({ message: "Newsletter sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
