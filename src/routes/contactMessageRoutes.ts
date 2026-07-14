import express from "express";
import * as contactMessageController from "../controller/contactMessageController.js";
import { body } from "express-validator";

const router = express.Router();
router.post(
  "/",
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("message").notEmpty().withMessage("Message is required"),
  contactMessageController.submitContactMessage,
);


export default router;
