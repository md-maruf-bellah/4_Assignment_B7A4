import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { sendResponse } from "../utils/sendResponse";
import * as propertyService from "../services/property.service";
import { UnauthorizedError } from "../utils/AppError";

// ---- Public ----

export const getProperties = catchAsync(async (req: Request, res: Response) => {
  const { properties, meta } = await propertyService.listProperties(
    req.query as any,
  );
  sendResponse(res, {
    statusCode: 200,
    message: "Properties retrieved successfully",
    data: properties,
    meta,
  });
});

export const getPropertyById = catchAsync(
  async (req: Request, res: Response) => {
    const property = await propertyService.getPropertyById(
      req.params.id as string,
    );
    sendResponse(res, {
      statusCode: 200,
      message: "Property retrieved successfully",
      data: property,
    });
  },
);

export const getCategories = catchAsync(async (req: Request, res: Response) => {
  const categories = await propertyService.listCategories();
  sendResponse(res, {
    statusCode: 200,
    message: "Categories retrieved successfully",
    data: categories,
  });
});

export const createCategory = catchAsync(
  async (req: Request, res: Response) => {
    const category = await propertyService.createCategory(req.body.name);
    sendResponse(res, {
      statusCode: 201,
      message: "Category created successfully",
      data: category,
    });
  },
);

// ---- Landlord ----

export const createProperty = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError();
    const property = await propertyService.createProperty(
      req.user.id,
      req.body,
    );
    sendResponse(res, {
      statusCode: 201,
      message: "Property listing created successfully",
      data: property,
    });
  },
);

export const updateProperty = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError();
    const property = await propertyService.updateProperty(
      req.params.id as string,
      req.user.id,
      req.body,
    );
    sendResponse(res, {
      statusCode: 200,
      message: "Property updated successfully",
      data: property,
    });
  },
);

export const deleteProperty = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError();
    await propertyService.deleteProperty(req.params.id as string, req.user.id);
    sendResponse(res, {
      statusCode: 200,
      message: "Property deleted successfully",
    });
  },
);

export const getMyProperties = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError();
    const properties = await propertyService.listLandlordProperties(
      req.user.id,
    );
    sendResponse(res, {
      statusCode: 200,
      message: "Your properties retrieved successfully",
      data: properties,
    });
  },
);
