import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../src/app";
import { bearer, createPatient, createUser, loginAs, resetDb } from "./helpers";

describe("Patients", () => {
  let admin = "";
  let staff = "";
  let patientId = "";

  beforeAll(async () => {
    await resetDb();
    await createUser("admin", "admin@test.com");
    await createUser("staff", "staff@test.com");
    admin = await loginAs("admin@test.com");
    staff = await loginAs("staff@test.com");
    patientId = (await createPatient(staff, "AB123456")).id;
  });

  it("refuse l'accès sans token (401)", async () => {
    const res = await request(app).get("/api/patients");
    expect(res.status).toBe(401);
  });

  it("refuse un CIN déjà utilisé (409)", async () => {
    const res = await request(app)
      .post("/api/patients")
      .set(bearer(staff))
      .send({ fullName: "Doublon", cin: "AB123456", phone: "0611111111", birthDate: "1991-02-02" });
    expect(res.status).toBe(409);
  });

  it("refuse des données invalides (400)", async () => {
    const res = await request(app).post("/api/patients").set(bearer(staff)).send({ fullName: "X" });
    expect(res.status).toBe(400);
  });

  it("liste avec recherche et pagination", async () => {
    const res = await request(app).get("/api/patients?search=ab12&page=1&limit=5").set(bearer(staff));
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.pagination.total).toBe(1);
  });

  it("interdit la suppression au staff (403)", async () => {
    const res = await request(app).delete(`/api/patients/${patientId}`).set(bearer(staff));
    expect(res.status).toBe(403);
  });

  it("autorise la suppression à l'admin (204) puis le patient disparaît (404)", async () => {
    const del = await request(app).delete(`/api/patients/${patientId}`).set(bearer(admin));
    expect(del.status).toBe(204);

    const get = await request(app).get(`/api/patients/${patientId}`).set(bearer(admin));
    expect(get.status).toBe(404);
  });
});