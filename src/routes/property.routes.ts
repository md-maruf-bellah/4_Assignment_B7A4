import { Router } from "express";
import * as propertyController from "../controllers/property.controller";
import { validateRequest } from "../middleware/validateRequest";
import {
  getPropertiesQuerySchema,
  propertyIdParamSchema,
} from "../validators/property.validator";

const router = Router();

router.get(
  "/properties",
  validateRequest(getPropertiesQuerySchema),
  propertyController.getProperties,
);
router.get(
  "/properties/:id",
  validateRequest(propertyIdParamSchema),
  propertyController.getPropertyById,
);
router.get("/categories", propertyController.getCategories);

export default router;
