import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError";
import { env } from "../config";
import { Prisma } from "../../generated/prisma/client";

// Structured error envelope required by spec: { success, message, errorDetails }
export function globalErrorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) {
  let statusCode = 500;
  let message = "Something went wrong";
  let errorDetails: unknown = null;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errorDetails = err.errorDetails;
  } else if (err instanceof ZodError) {
    statusCode = 400;
    message = "Validation failed";
    errorDetails = err.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }));
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      statusCode = 409;
      message = "A record with this value already exists";
      errorDetails = { target: err.meta?.target };
    } else if (err.code === "P2025") {
      statusCode = 404;
      message = "Record not found";
      errorDetails = err.meta;
    } else if (err.code === "P2003") {
      statusCode = 400;
      message = "Invalid reference to a related record";
      errorDetails = err.meta;
    } else {
      statusCode = 400;
      message = "Database request error";
      errorDetails = { code: err.code };
    }
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = "Invalid data sent to database";
  } else if (err instanceof Error) {
    message = err.message || message;
    if (env.nodeEnv !== "production") {
      errorDetails = { stack: err.stack };
    }
  }

  if (env.nodeEnv !== "production") {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  return res.status(statusCode).json({
    success: false,
    message,
    errorDetails,
  });
}

export function notFoundHandler(req: Request, res: Response) {
  return res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    errorDetails: null,
  });
}
