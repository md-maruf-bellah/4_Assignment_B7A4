import { NextFunction, Request, Response } from "express";
import { verifyToken, JwtPayload } from "../utils/jwt";
import { UnauthorizedError, ForbiddenError } from "../utils/AppError";
import { prisma } from "../lib/prisma";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      throw new UnauthorizedError(
        "Authentication token missing. Use 'Bearer <token>'",
      );
    }
    const parts = header.split(" ");
    const token = parts[1];
    if (!token) {
      throw new UnauthorizedError(
        "Authentication token missing. Use 'Bearer <token>'",
      );
    }
    const decoded = verifyToken(token);

    // Ensure the user still exists and is not banned
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) {
      throw new UnauthorizedError(
        "User belonging to this token no longer exists",
      );
    }
    if (user.status === "BANNED") {
      throw new ForbiddenError(
        "Your account has been banned. Contact support.",
      );
    }

    req.user = { id: user.id, role: user.role, email: user.email };
    next();
  } catch (err) {
    next(err);
  }
};

export const authorize = (...roles: Array<"TENANT" | "LANDLORD" | "ADMIN">) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }
    if (!roles.includes(req.user.role)) {
      return next(
        new ForbiddenError(`This action requires role: ${roles.join(" or ")}`),
      );
    }
    next();
  };
};
