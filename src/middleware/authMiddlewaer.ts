import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

// Middleware to check if the user is authenticated
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
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
    };

    // Attach the decoded user information to the request object
    (req as any).user = decoded;
    next();
    // If the token is valid, proceed to the next middleware or route handler
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
    return;
  }
};
