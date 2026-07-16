import { User } from "../../generated/prisma/client";
import { prisma } from "../lib/prisma";
import { NotFoundError, BadRequestError } from "../utils/AppError";

export async function getAllUsers() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });
  return users.map(({ password, ...rest }: User) => rest);
}

export async function updateUserStatus(
  userId: string,
  status: "ACTIVE" | "BANNED",
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError("User");
  if (user.role === "ADMIN") {
    throw new BadRequestError("Admin accounts cannot be banned");
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { status },
  });
  const { password, ...safeUser } = updated;
  return safeUser;
}

export async function getAllProperties() {
  return prisma.property.findMany({
    include: {
      landlord: { select: { id: true, name: true, email: true } },
      category: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAllRentalRequests() {
  return prisma.rentalRequest.findMany({
    include: {
      tenant: { select: { id: true, name: true, email: true } },
      property: true,
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });
}
