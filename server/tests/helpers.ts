import bcrypt from "bcrypt";
import request from "supertest";
import app from "../src/app";
import { prisma } from "../src/config/prisma";

export const PASSWORD = "Test1234!";

export async function resetDb() {
  await prisma.auditLog.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.user.deleteMany();
}

export async function createUser(role: "admin" | "staff", email: string) {
  const passwordHash = await bcrypt.hash(PASSWORD, 4);
  return prisma.user.create({ data: { email, passwordHash, fullName: `Test ${role}`, role } });
}

export async function loginAs(email: string): Promise<string> {
  const res = await request(app).post("/api/auth/login").send({ email, password: PASSWORD });
  return res.body.token as string;
}

export const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });

export async function createPatient(token: string, cin = "TT000001") {
  const res = await request(app)
    .post("/api/patients")
    .set(bearer(token))
    .send({ fullName: "Patient Test", cin, phone: "0600000000", birthDate: "1990-01-01" });
  return res.body as { id: string };
}