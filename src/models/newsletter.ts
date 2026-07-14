import mongoose from "mongoose";

// Define the schema for the "Newsletter" collection in the MongoDB database
const newsletterSchema = new mongoose.Schema(
  {
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
  },
  { timestamps: true }
);

const Newsletter = mongoose.model("Newsletter", newsletterSchema);

export default Newsletter;