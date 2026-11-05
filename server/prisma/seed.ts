import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Date relative à aujourd'hui : jours décalés + heure + minutes
function at(dayOffset: number, hour: number, minute = 0): Date {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d;
}

async function main() {
  // Nettoyage (ordre important à cause des clés étrangères)
  await prisma.auditLog.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.user.deleteMany();

  // ---------- Utilisateurs ----------
  const adminHash = await bcrypt.hash("Admin123!", 10);
  const staffHash = await bcrypt.hash("Staff123!", 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@clinicflow.com",
      passwordHash: adminHash,
      fullName: "Admin ClinicFlow",
      role: "admin",
    },
  });

  const staff1 = await prisma.user.create({
    data: {
      email: "staff1@clinicflow.com",
      passwordHash: staffHash,
      fullName: "Salma Benani",
      role: "staff",
    },
  });

  const staff2 = await prisma.user.create({
    data: {
      email: "staff2@clinicflow.com",
      passwordHash: staffHash,
      fullName: "Youssef Alaoui",
      role: "staff",
    },
  });

  // ---------- Patients ----------
  const patientsData = [
    { fullName: "Ahmed El Idrissi", cin: "AB123456", phone: "0612345678", birthDate: new Date("1985-03-12"), address: "Casablanca" },
    { fullName: "Fatima Zahra Bennani", cin: "CD234567", phone: "0623456789", birthDate: new Date("1992-07-25"), address: "Rabat" },
    { fullName: "Mohamed Tazi", cin: "EF345678", phone: "0634567890", birthDate: new Date("1978-11-02"), address: null },
    { fullName: "Khadija Amrani", cin: "GH456789", phone: "0645678901", birthDate: new Date("2000-01-30"), address: "Marrakech" },
    { fullName: "Omar Berrada", cin: "IJ567890", phone: "0656789012", birthDate: new Date("1965-09-18"), address: "Tanger" },
  ];

  const patients = [];
  for (const data of patientsData) {
    patients.push(await prisma.patient.create({ data }));
  }
  const [p1, p2, p3, p4, p5] = patients;

  // ---------- Rendez-vous (10) ----------
  // Aucun couple de RDV "confirmed" du même patient à moins de 30 min.
  await prisma.appointment.createMany({
    data: [
      // Aujourd'hui
      { patientId: p1.id, appointmentDate: at(0, 9, 0),  status: "confirmed", reason: "Consultation générale", createdById: staff1.id },
      { patientId: p2.id, appointmentDate: at(0, 10, 30), status: "pending",   reason: "Douleurs dorsales",    createdById: staff1.id },
      { patientId: p3.id, appointmentDate: at(0, 14, 0),  status: "confirmed", reason: "Contrôle tension",     createdById: staff2.id },
      // Demain et après
      { patientId: p1.id, appointmentDate: at(1, 9, 0),   status: "pending",   reason: "Analyse de sang",      createdById: staff2.id },
      { patientId: p4.id, appointmentDate: at(1, 11, 0),  status: "confirmed", reason: "Vaccination",          createdById: staff1.id },
      { patientId: p5.id, appointmentDate: at(2, 15, 30), status: "pending",   reason: "Suivi diabète",        createdById: admin.id },
      { patientId: p2.id, appointmentDate: at(3, 10, 0),  status: "confirmed", reason: "Radiographie",         createdById: staff1.id },
      // Passés / annulés
      { patientId: p3.id, appointmentDate: at(-1, 16, 0), status: "cancelled", reason: "Consultation ORL",     notes: "Patient absent", createdById: staff2.id },
      { patientId: p4.id, appointmentDate: at(-2, 9, 30), status: "cancelled", reason: "Certificat médical",   createdById: staff1.id },
      { patientId: p5.id, appointmentDate: at(-3, 11, 0), status: "confirmed", reason: "Bilan annuel",         createdById: admin.id },
    ],
  });

  console.log("Seed terminé : 1 admin, 2 staff, 5 patients, 10 rendez-vous");
  console.log("Admin : admin@clinicflow.com / Admin123!");
  console.log("Staff : staff1@clinicflow.com / Staff123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });