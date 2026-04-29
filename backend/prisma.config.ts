import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Prisma 7.x: ใช้ DATABASE_URL สำหรับทั้ง runtime และ migrate
    // (Supabase Session Pooler port 5432 รองรับ migrations ได้)
    url: process.env["DATABASE_URL"],
  },
});
