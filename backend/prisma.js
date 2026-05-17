require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaLibSQL } = require('@prisma/adapter-libsql');
const { createClient } = require('@libsql/client');

let prisma;

if (process.env.TURSO_DATABASE_URL) {
  // Use Turso if the environment variable is set
  const libsql = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  const adapter = new PrismaLibSQL(libsql);
  prisma = new PrismaClient({ adapter });
  console.log("Prisma connected via Turso (libSQL)");
} else {
  // Fallback to standard SQLite (local development)
  prisma = new PrismaClient();
  console.log("Prisma connected via local SQLite");
}

module.exports = prisma;
