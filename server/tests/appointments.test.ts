import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../src/app";
import { bearer, createPatient, createUser, loginAs, resetDb } from "./helpers";

const slot = (day: number, h: number, m = 0) => new Date(Date.UTC(2030, 0, day, h, m)).toISOString();

describe("Rendez-vous : règle des 30 minutes", () => {
  let token = "";
  let patientId = "";

  const create = (body: Record<string, unknown>) =>
    request(app).post("/api/appointments").set(bearer(token)).send({ patientId, reason: "Test", ...body });

  const setStatus = (id: string, status: string) =>
    request(app).patch(`/api/appointments/${id}/status`).set(bearer(token)).send({ status });

  beforeAll(async () => {
    await resetDb();
    await createUser("staff", "staff@test.com");
    token = await loginAs("staff@test.com");
    patientId = (await createPatient(token)).id;
  });

  it("crée un rendez-vous confirmé", async () => {
    const res = await create({ appointmentDate: slot(10, 10, 0), status: "confirmed" });
    expect(res.status).toBe(201);
  });

  it("refuse un 2e confirmé à 15 min d'écart (409)", async () => {
    const res = await create({ appointmentDate: slot(10, 10, 15), status: "confirmed" });
    expect(res.status).toBe(409);
  });

  it("accepte un confirmé à exactement 30 min d'écart (201)", async () => {
    const res = await create({ appointmentDate: slot(10, 10, 30), status: "confirmed" });
    expect(res.status).toBe(201);
  });

  it("accepte un rendez-vous pending dans la fenêtre (201)", async () => {
    const res = await create({ appointmentDate: slot(10, 10, 10), status: "pending" });
    expect(res.status).toBe(201);
  });

  it("refuse de confirmer un rendez-vous en conflit (409)", async () => {
    const pending = await create({ appointmentDate: slot(11, 14, 10), status: "pending" });
    await create({ appointmentDate: slot(11, 14, 0), status: "confirmed" });
    const res = await setStatus(pending.body.id, "confirmed");
    expect(res.status).toBe(409);
  });

  it("libère le créneau quand le rendez-vous est annulé", async () => {
    const a = await create({ appointmentDate: slot(12, 9, 0), status: "confirmed" });
    const b = await create({ appointmentDate: slot(12, 9, 10), status: "pending" });

    expect((await setStatus(b.body.id, "confirmed")).status).toBe(409);
    expect((await setStatus(a.body.id, "cancelled")).status).toBe(200);
    expect((await setStatus(b.body.id, "confirmed")).status).toBe(200);
  });

  it("la base bloque aussi deux requêtes simultanées (contrainte EXCLUDE)", async () => {
    const [r1, r2] = await Promise.all([
      create({ appointmentDate: slot(13, 16, 0), status: "confirmed" }),
      create({ appointmentDate: slot(13, 16, 10), status: "confirmed" }),
    ]);
    expect([r1.status, r2.status].sort()).toEqual([201, 409]);
  });

  it("refuse un patient inexistant (404) et un statut invalide (400)", async () => {
    const missing = await create({
      patientId: "00000000-0000-4000-8000-000000000000",
      appointmentDate: slot(14, 9, 0),
    });
    expect(missing.status).toBe(404);

    const invalid = await create({ appointmentDate: slot(14, 9, 0), status: "nimporte" });
    expect(invalid.status).toBe(400);
  });

  it("filtre par date et par statut", async () => {
    const res = await request(app)
      .get("/api/appointments?date=2030-01-10&status=confirmed")
      .set(bearer(token));
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });
});