import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { sendResponse } from "../utils/sendResponse";
import * as reviewService from "../services/review.service";
import { UnauthorizedError } from "../utils/AppError";

export const createReview = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError();
  const review = await reviewService.createReview(req.user.id, req.body);
  sendResponse(res, {
    statusCode: 201,
    message: "Review submitted successfully",
    data: review,
  });
});
