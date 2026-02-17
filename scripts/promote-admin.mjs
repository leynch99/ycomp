#!/usr/bin/env node
/**
 * Promote a user to admin by email.
 * Usage: node scripts/promote-admin.mjs user@example.com
 */
import { PrismaClient } from "@prisma/client";

const email = process.argv[2];
if (!email) {
  console.error("Usage: node scripts/promote-admin.mjs <email>");
  process.exit(1);
}

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.update({
    where: { email },
    data: { role: "ADMIN" },
  });
  console.log(`✅ ${user.email} is now ADMIN`);
}

main()
  .catch((e) => {
    if (e.code === "P2025") {
      console.error(`❌ User with email "${email}" not found`);
    } else {
      console.error(e);
    }
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
