export class AppError extends Error {
  public statusCode: number;
  public errorDetails: unknown;
  public isOperational: boolean;

  constructor(message: string, statusCode = 500, errorDetails: unknown = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorDetails = errorDetails;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(`${resource} not found`, 404);
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad request", errorDetails: unknown = null) {
    super(message, 400, errorDetails);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden: insufficient permissions") {
    super(message, 403);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflict") {
    super(message, 409);
  }
}
