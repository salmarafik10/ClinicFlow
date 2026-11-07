import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../src/app";
import { PASSWORD, bearer, createUser, loginAs, resetDb } from "./helpers";

describe("Authentification", () => {
  beforeAll(async () => {
    await resetDb();
    await createUser("admin", "admin@test.com");
  });

  it("connecte avec de bons identifiants", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: "admin@test.com", password: PASSWORD });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTypeOf("string");
    expect(res.body.user.role).toBe("admin");
  });

  it("refuse un mauvais mot de passe (401)", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: "admin@test.com", password: "faux" });
    expect(res.status).toBe(401);
  });

  it("refuse un email invalide (400)", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: "pas-un-email", password: "x" });
    expect(res.status).toBe(400);
  });

  it("refuse /me sans token (401)", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("renvoie l'utilisateur sur /me avec un token", async () => {
    const token = await loginAs("admin@test.com");
    const res = await request(app).get("/api/auth/me").set(bearer(token));
    expect(res.status).toBe(200);
    expect(res.body.email).toBe("admin@test.com");
  });
});