import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { sendResponse } from "../utils/sendResponse";
import * as adminService from "../services/admin.service";

export const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const users = await adminService.getAllUsers();
  sendResponse(res, {
    statusCode: 200,
    message: "All users retrieved successfully",
    data: users,
  });
});

export const updateUserStatus = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.params.id;
    if (!id) throw new Error("Missing user id");
    const user = await adminService.updateUserStatus(id, req.body.status);
    sendResponse(res, {
      statusCode: 200,
      message: "User status updated successfully",
      data: user,
    });
  },
);

export const getAllProperties = catchAsync(
  async (req: Request, res: Response) => {
    const properties = await adminService.getAllProperties();
    sendResponse(res, {
      statusCode: 200,
      message: "All properties retrieved successfully",
      data: properties,
    });
  },
);

export const getAllRentalRequests = catchAsync(
  async (req: Request, res: Response) => {
    const rentals = await adminService.getAllRentalRequests();
    sendResponse(res, {
      statusCode: 200,
      message: "All rental requests retrieved successfully",
      data: rentals,
    });
  },
);
