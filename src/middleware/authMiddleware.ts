import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import User from "../models/user.js";

// Middleware to check if the user is authenticated
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  // Get the token from the Authorization header
  const token = req.headers.authorization?.split(" ")[1];

  // If no token is provided, return an error
  if (!token) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  // Verify the token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      // Define the structure of the decoded token
      userId: string;
      email: string;
      role: string;
      iat?: number;
    };

    // Find the user in the database using the decoded userId
    const user = await User.findById(decoded.userId);

    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Check if the user's password has been changed after the token was issued
    const tokenIssuedAt = decoded.iat ? decoded.iat * 1000 : 0;

    if (
      user.passwordChangedAt &&
      tokenIssuedAt < user.passwordChangedAt.getTime()
    ) {
      res.status(401).json({
        message: "Password was changed. Please login again.",
      });
      return;
    }

    // Attach the decoded user information to the request object
    req.user = decoded;
    next();
    // If the token is valid, proceed to the next middleware or route handler
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
    return;
  }
};
