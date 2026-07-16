import { Router } from "express";
import * as adminController from "../controllers/admin.controller";
import * as propertyController from "../controllers/property.controller";
import { authenticate, authorize } from "../middleware/auth";
import { validateRequest } from "../middleware/validateRequest";
import { updateUserStatusSchema } from "../validators/admin.validator";
import { createCategorySchema } from "../validators/property.validator";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.get("/users", adminController.getAllUsers);
router.patch(
  "/users/:id",
  validateRequest(updateUserStatusSchema),
  adminController.updateUserStatus,
);
router.get("/properties", adminController.getAllProperties);
router.get("/rentals", adminController.getAllRentalRequests);
router.post(
  "/categories",
  validateRequest(createCategorySchema),
  propertyController.createCategory,
);

export default router;
