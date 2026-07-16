import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { sendResponse } from "../utils/sendResponse";
import { UnauthorizedError } from "../utils/AppError";
import { authService } from "../services/auth.service";

export const register = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.registerUser(req.body);
  sendResponse(res, {
    statusCode: 201,
    message: "User registered successfully",
    data: result,
  });
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await authService.loginUser(email, password);
  sendResponse(res, {
    statusCode: 200,
    message: "Login successful",
    data: result,
  });
});

export const me = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError();
  const user = await authService.getMe(req.user.id);
  sendResponse(res, {
    statusCode: 200,
    message: "Current user retrieved successfully",
    data: user,
  });
});
