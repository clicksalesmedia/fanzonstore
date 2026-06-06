// Create (or update) an admin user for the Fanzonstore backend.
//
//   node scripts/create-admin.mjs <email> <password> [name]
//
// If the email already exists, its password and role are updated.
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const [, , email, password, name] = process.argv;

if (!email || !password) {
  console.error("Usage: node scripts/create-admin.mjs <email> <password> [name]");
  process.exit(1);
}

const prisma = new PrismaClient();

try {
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.upsert({
    where: { email: email.toLowerCase().trim() },
    update: { passwordHash, role: "ADMIN", ...(name ? { name } : {}) },
    create: {
      email: email.toLowerCase().trim(),
      passwordHash,
      role: "ADMIN",
      name: name ?? null,
    },
  });
  console.log(`✅ Admin ready: ${user.email} (${user.id})`);
} catch (err) {
  console.error("❌ Failed to create admin:", err.message);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
