import { Router } from "express";
import * as paymentController from "../controllers/payment.controller";
import { authenticate, authorize } from "../middleware/auth";
import { validateRequest } from "../middleware/validateRequest";
import {
  createPaymentSchema,
  confirmPaymentSchema,
  paymentIdParamSchema,
} from "../validators/payment.validator";

const router = Router();

router.get("/success", paymentController.paymentSuccessRedirect);
router.get("/cancel", paymentController.paymentCancelRedirect);

router.use(authenticate);

router.post(
  "/create",
  authorize("TENANT"),
  validateRequest(createPaymentSchema),
  paymentController.createPayment,
);
router.post(
  "/confirm",
  authorize("TENANT"),
  validateRequest(confirmPaymentSchema),
  paymentController.confirmPayment,
);
router.get("/", paymentController.getPaymentHistory);
router.get(
  "/:id",
  validateRequest(paymentIdParamSchema),
  paymentController.getPaymentById,
);

export default router;
