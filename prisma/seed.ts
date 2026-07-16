import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { prisma } from "../src/lib/prisma";

dotenv.config();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin1@rentnest.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

async function main() {
  console.log("🌱 Starting database seeding...");

  // Test database connection
  await prisma.$connect();
  console.log("✅ Database connected successfully.");

  // ==========================
  // Admin
  // ==========================
  const hashedAdminPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

  const admin = await prisma.user.upsert({
    where: {
      email: ADMIN_EMAIL,
    },
    update: {},
    create: {
      name: "RentNest Admin",
      email: ADMIN_EMAIL,
      password: hashedAdminPassword,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  console.log(`✅ Admin ready: ${admin.email}`);

  // ==========================
  // Categories
  // ==========================
  const categoryNames = ["Apartment", "House", "Studio", "Condo", "Room"];

  const categories = [];

  for (const name of categoryNames) {
    const category = await prisma.category.upsert({
      where: {
        slug: name.toLowerCase(),
      },
      update: {},
      create: {
        name,
        slug: name.toLowerCase(),
      },
    });

    categories.push(category);
  }

  console.log(`✅ ${categories.length} Categories Ready`);

  // ==========================
  // Demo Landlord
  // ==========================
  const landlordPassword = await bcrypt.hash("landlord123", 12);

  const landlord = await prisma.user.upsert({
    where: {
      email: "landlord@rentnest.com",
    },
    update: {},
    create: {
      name: "Karim Rahman",
      email: "landlord@rentnest.com",
      password: landlordPassword,
      phone: "+8801700000000",
      role: "LANDLORD",
      status: "ACTIVE",
    },
  });

  console.log("✅ Demo Landlord Ready");

  // ==========================
  // Demo Tenant
  // ==========================
  const tenantPassword = await bcrypt.hash("tenant123", 12);

  const tenant = await prisma.user.upsert({
    where: {
      email: "tenant@rentnest.com",
    },
    update: {},
    create: {
      name: "Ayesha Siddiqua",
      email: "tenant@rentnest.com",
      password: tenantPassword,
      phone: "+8801800000000",
      role: "TENANT",
      status: "ACTIVE",
    },
  });

  console.log("✅ Demo Tenant Ready");

  // ==========================
  // Demo Properties
  // ==========================
  const apartmentCategory = categories.find(
    (category) => category.slug === "apartment",
  );

  const houseCategory = categories.find(
    (category) => category.slug === "house",
  );

  if (!apartmentCategory || !houseCategory) {
    throw new Error("Required categories not found.");
  }

  const existingProperty = await prisma.property.findFirst({
    where: {
      landlordId: landlord.id,
    },
  });

  if (!existingProperty) {
    await prisma.property.createMany({
      data: [
        {
          title: "Cozy 2-Bed Apartment in Rajshahi",
          description:
            "A well-lit modern apartment close to the university with 24/7 security.",
          type: "APARTMENT",
          price: 15000,
          location: "Shaheb Bazar",
          city: "Rajshahi",
          address: "House 12, Road 4, Shaheb Bazar, Rajshahi",
          bedrooms: 2,
          bathrooms: 2,
          areaSqft: 950,
          amenities: ["WiFi", "Parking", "Generator", "Security"],
          images: [],
          categoryId: apartmentCategory.id,
          landlordId: landlord.id,
        },
        {
          title: "Spacious Family House with Garden",
          description:
            "A beautiful family house with a private garden and spacious living area.",
          type: "HOUSE",
          price: 35000,
          location: "Uposhohor",
          city: "Rajshahi",
          address: "House 5, Block C, Uposhohor, Rajshahi",
          bedrooms: 4,
          bathrooms: 3,
          areaSqft: 2200,
          amenities: ["Garden", "Parking", "WiFi"],
          images: [],
          categoryId: houseCategory.id,
          landlordId: landlord.id,
        },
      ],
    });

    console.log("✅ Demo Properties Created");
  } else {
    console.log("ℹ️ Demo Properties Already Exist");
  }

  console.log("");
  console.log("🎉 Database seeding completed successfully!");
  console.log("");
  console.log("Admin");
  console.log(`Email: ${ADMIN_EMAIL}`);
  console.log(`Password: ${ADMIN_PASSWORD}`);
  console.log("");
  console.log("Landlord");
  console.log("Email: landlord@rentnest.com");
  console.log("Password: landlord123");
  console.log("");
  console.log("Tenant");
  console.log("Email: tenant@rentnest.com");
  console.log("Password: tenant123");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log("🔌 Prisma disconnected.");
  });
