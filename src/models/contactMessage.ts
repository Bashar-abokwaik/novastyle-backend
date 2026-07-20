import mongoose from "mongoose";

// Define the schema for contact messages
const contactMessageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      default: "",
    },
    message: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

const ContactMessage = mongoose.model("ContactMessage", contactMessageSchema);

export default ContactMessage;
