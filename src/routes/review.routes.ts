import { Router } from "express";
import * as reviewController from "../controllers/review.controller";
import { authenticate, authorize } from "../middleware/auth";
import { validateRequest } from "../middleware/validateRequest";
import { createReviewSchema } from "../validators/review.validator";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("TENANT"),
  validateRequest(createReviewSchema),
  reviewController.createReview,
);

export default router;
