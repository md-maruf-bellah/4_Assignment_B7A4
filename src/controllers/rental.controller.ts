import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { sendResponse } from "../utils/sendResponse";
import * as rentalService from "../services/rental.service";
import { UnauthorizedError } from "../utils/AppError";

export const createRentalRequest = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError();
    const rental = await rentalService.createRentalRequest(
      req.user.id,
      req.body,
    );
    sendResponse(res, {
      statusCode: 201,
      message: "Rental request submitted successfully",
      data: rental,
    });
  },
);

export const getMyRentalRequests = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError();
    const rentals = await rentalService.getTenantRentalRequests(req.user.id);
    sendResponse(res, {
      statusCode: 200,
      message: "Rental requests retrieved successfully",
      data: rentals,
    });
  },
);

export const getRentalRequestById = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError();
    const rental = await rentalService.getRentalRequestById(
      req.params.id as string,
      req.user.id,
      req.user.role,
    );
    sendResponse(res, {
      statusCode: 200,
      message: "Rental request retrieved successfully",
      data: rental,
    });
  },
);

export const getLandlordRentalRequests = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError();
    const rentals = await rentalService.getLandlordRentalRequests(req.user.id);
    sendResponse(res, {
      statusCode: 200,
      message: "Rental requests for your properties retrieved successfully",
      data: rentals,
    });
  },
);

export const updateRentalRequestStatus = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError();
    const { status, rejectReason } = req.body;
    const rental = await rentalService.updateRentalRequestStatus(
      req.params.id as string,
      req.user.id,
      status,
      rejectReason,
    );
    sendResponse(res, {
      statusCode: 200,
      message: `Rental request ${status.toLowerCase()} successfully`,
      data: rental,
    });
  },
);
