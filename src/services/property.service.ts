import { NotFoundError, ForbiddenError } from "../utils/AppError";
import { prisma } from "../lib/prisma";
import { Prisma } from "../../generated/prisma/client";

interface ListFilters {
  location?: string;
  city?: string;
  type?: string;
  minPrice?: string;
  maxPrice?: string;
  amenities?: string;
  page?: string;
  limit?: string;
}

export async function listProperties(filters: ListFilters) {
  const page = Math.max(parseInt(filters.page || "1", 10), 1);
  const limit = Math.min(Math.max(parseInt(filters.limit || "10", 10), 1), 50);
  const skip = (page - 1) * limit;

  const where: Prisma.PropertyWhereInput = {
    status: "AVAILABLE",
  };

  if (filters.location) {
    where.location = { contains: filters.location, mode: "insensitive" };
  }
  if (filters.city) {
    where.city = { contains: filters.city, mode: "insensitive" };
  }
  if (filters.type) {
    where.type = filters.type as Prisma.EnumPropertyTypeFilter["equals"];
  }
  if (filters.minPrice || filters.maxPrice) {
    where.price = {};
    if (filters.minPrice)
      where.price.gte = new Prisma.Decimal(filters.minPrice);
    if (filters.maxPrice)
      where.price.lte = new Prisma.Decimal(filters.maxPrice);
  }
  if (filters.amenities) {
    const amenityList = filters.amenities
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);
    if (amenityList.length) {
      where.amenities = { hasSome: amenityList };
    }
  }

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        landlord: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    }),
    prisma.property.count({ where }),
  ]);

  return {
    properties,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getPropertyById(id: string) {
  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      category: true,
      landlord: { select: { id: true, name: true, email: true, phone: true } },
      reviews: {
        include: { tenant: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!property) throw new NotFoundError("Property");
  return property;
}

export async function listCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

export async function createCategory(name: string) {
  const slug = name.toLowerCase().trim().replace(/\s+/g, "-");
  return prisma.category.create({ data: { name, slug } });
}

// ---- Landlord-scoped operations ----

export async function createProperty(landlordId: string, data: any) {
  const category = await prisma.category.findUnique({
    where: { id: data.categoryId },
  });
  if (!category) throw new NotFoundError("Category");

  return prisma.property.create({
    data: {
      ...data,
      landlordId,
    },
  });
}

async function assertOwnership(propertyId: string, landlordId: string) {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  });
  if (!property) throw new NotFoundError("Property");
  if (property.landlordId !== landlordId) {
    throw new ForbiddenError("You do not own this property");
  }
  return property;
}

export async function updateProperty(
  propertyId: string,
  landlordId: string,
  data: any,
) {
  await assertOwnership(propertyId, landlordId);
  if (data.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });
    if (!category) throw new NotFoundError("Category");
  }
  return prisma.property.update({ where: { id: propertyId }, data });
}

export async function deleteProperty(propertyId: string, landlordId: string) {
  await assertOwnership(propertyId, landlordId);
  await prisma.property.delete({ where: { id: propertyId } });
}

export async function listLandlordProperties(landlordId: string) {
  return prisma.property.findMany({
    where: { landlordId },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
}
