import { prisma } from "../lib/prisma";
import {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
  ConflictError,
} from "../utils/AppError";

export async function createReview(
  tenantId: string,
  data: { rentalRequestId: string; rating: number; comment: string },
) {
  const rental = await prisma.rentalRequest.findUnique({
    where: { id: data.rentalRequestId },
    include: { review: true },
  });

  if (!rental) throw new NotFoundError("Rental request");
  if (rental.tenantId !== tenantId) {
    throw new ForbiddenError("You can only review your own completed rentals");
  }
  if (!["ACTIVE", "COMPLETED"].includes(rental.status)) {
    throw new BadRequestError(
      "You can only review a rental after it has been paid for / completed",
    );
  }
  if (rental.review) {
    throw new ConflictError("You have already reviewed this rental");
  }

  return prisma.review.create({
    data: {
      tenantId,
      propertyId: rental.propertyId,
      rentalRequestId: rental.id,
      rating: data.rating,
      comment: data.comment,
    },
  });
}
