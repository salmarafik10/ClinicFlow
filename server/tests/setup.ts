import { afterAll } from "vitest";

// Sécurité : on refuse de lancer les tests sur une base qui n'est pas une base de test
const url = process.env.DATABASE_URL ?? "";
if (!/test/i.test(url)) {
  throw new Error("Tests refusés : DATABASE_URL doit pointer vers une base de test (nom contenant 'test').");
}

afterAll(async () => {
  const { prisma } = await import("../src/config/prisma");
  await prisma.$disconnect();
});