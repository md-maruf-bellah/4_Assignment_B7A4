import app from "./app";
import { env } from "./config";
import { prisma } from "./lib/prisma";

const port = Number(env.port);

async function main() {
  try {
    await prisma.$connect();
    // eslint-disable-next-line no-console
    console.log("Connected to PostgreSQL database via Prisma");

    const server = app.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`RentNest API server running on http://localhost:${port}`);
    });

    process.on("unhandledRejection", (reason) => {
      // eslint-disable-next-line no-console
      console.error("Unhandled Rejection:", reason);
      server.close(() => process.exit(1));
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

main();
