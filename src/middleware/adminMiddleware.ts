import { Request, Response, NextFunction } from "express";

// Middleware to check if the user is an admin
export const adminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Check if the user is authenticated
  if (!(req as any).user) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  // Check if the user has the admin role
  if ((req as any).user.role !== "admin") {
    return res.status(403).json({
      message: "Access denied",
    });
  }

  next(); 
};
