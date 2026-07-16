import { prisma } from "../lib/prisma";
import {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
} from "../utils/AppError";

export async function createRentalRequest(
  tenantId: string,
  data: { propertyId: string; moveInDate: string; message?: string },
) {
  const property = await prisma.property.findUnique({
    where: { id: data.propertyId },
  });
  if (!property) throw new NotFoundError("Property");
  if (property.status !== "AVAILABLE") {
    throw new BadRequestError(
      "This property is not currently available for rent",
    );
  }
  if (property.landlordId === tenantId) {
    throw new BadRequestError("You cannot request to rent your own property");
  }

  const existingPending = await prisma.rentalRequest.findFirst({
    where: { tenantId, propertyId: data.propertyId, status: "PENDING" },
  });
  if (existingPending) {
    throw new BadRequestError(
      "You already have a pending request for this property",
    );
  }

  return prisma.rentalRequest.create({
    data: {
      tenantId,
      propertyId: data.propertyId,
      moveInDate: new Date(data.moveInDate),
      message: data.message,
    },
    include: { property: true },
  });
}

export async function getTenantRentalRequests(tenantId: string) {
  return prisma.rentalRequest.findMany({
    where: { tenantId },
    include: { property: true, payment: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getRentalRequestById(
  id: string,
  requesterId: string,
  role: string,
) {
  const rental = await prisma.rentalRequest.findUnique({
    where: { id },
    include: {
      property: true,
      tenant: { select: { id: true, name: true, email: true } },
      payment: true,
    },
  });
  if (!rental) throw new NotFoundError("Rental request");

  const isTenant = rental.tenantId === requesterId;
  const isLandlord = rental.property.landlordId === requesterId;
  if (!isTenant && !isLandlord && role !== "ADMIN") {
    throw new ForbiddenError("You do not have access to this rental request");
  }
  return rental;
}

export async function getLandlordRentalRequests(landlordId: string) {
  return prisma.rentalRequest.findMany({
    where: { property: { landlordId } },
    include: {
      property: true,
      tenant: { select: { id: true, name: true, email: true, phone: true } },
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateRentalRequestStatus(
  requestId: string,
  landlordId: string,
  status: "APPROVED" | "REJECTED",
  rejectReason?: string,
) {
  const rental = await prisma.rentalRequest.findUnique({
    where: { id: requestId },
    include: { property: true },
  });
  if (!rental) throw new NotFoundError("Rental request");
  if (rental.property.landlordId !== landlordId) {
    throw new ForbiddenError("You do not manage this property");
  }
  if (rental.status !== "PENDING") {
    throw new BadRequestError(
      `This request has already been ${rental.status.toLowerCase()}`,
    );
  }

  return prisma.rentalRequest.update({
    where: { id: requestId },
    data: {
      status,
      rejectReason:
        status === "REJECTED" ? (rejectReason ?? "Not specified") : null,
    },
  });
}
