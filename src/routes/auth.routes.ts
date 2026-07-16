import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { validateRequest } from "../middleware/validateRequest";
import { registerSchema, loginSchema } from "../validators/auth.validator";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post(
  "/register",
  validateRequest(registerSchema),
  authController.register,
);
router.post("/login", validateRequest(loginSchema), authController.login);
router.get("/me", authenticate, authController.me);

export default router;
