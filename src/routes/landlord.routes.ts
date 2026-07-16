import { Router } from "express";
import * as propertyController from "../controllers/property.controller";
import * as rentalController from "../controllers/rental.controller";
import { authenticate, authorize } from "../middleware/auth";
import { validateRequest } from "../middleware/validateRequest";
import {
  createPropertySchema,
  updatePropertySchema,
  propertyIdParamSchema,
} from "../validators/property.validator";
import {
  updateRentalStatusSchema,
  rentalIdParamSchema,
} from "../validators/rental.validator";

const router = Router();

router.use(authenticate, authorize("LANDLORD"));

router.get("/properties", propertyController.getMyProperties);
router.post(
  "/properties",
  validateRequest(createPropertySchema),
  propertyController.createProperty,
);
router.put(
  "/properties/:id",
  validateRequest(updatePropertySchema),
  propertyController.updateProperty,
);
router.delete(
  "/properties/:id",
  validateRequest(propertyIdParamSchema),
  propertyController.deleteProperty,
);

router.get("/requests", rentalController.getLandlordRentalRequests);
router.patch(
  "/requests/:id",
  validateRequest(updateRentalStatusSchema),
  rentalController.updateRentalRequestStatus,
);

export default router;
