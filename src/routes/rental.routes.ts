import { Router } from "express";
import * as rentalController from "../controllers/rental.controller";
import { authenticate, authorize } from "../middleware/auth";
import { validateRequest } from "../middleware/validateRequest";
import {
  createRentalRequestSchema,
  rentalIdParamSchema,
} from "../validators/rental.validator";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  authorize("TENANT"),
  validateRequest(createRentalRequestSchema),
  rentalController.createRentalRequest,
);
router.get("/", authorize("TENANT"), rentalController.getMyRentalRequests);
router.get(
  "/:id",
  validateRequest(rentalIdParamSchema),
  rentalController.getRentalRequestById,
);

export default router;
