// This file is responsible for setting up the Brevo client using the API key from environment variables.

import { BrevoClient } from "@getbrevo/brevo";
import dotenv from "dotenv";

dotenv.config();

const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY!,
});

export default brevo;