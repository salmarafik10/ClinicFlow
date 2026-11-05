import { AppointmentStatus } from "@prisma/client";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";

const WINDOW_MS = 30 * 60 * 1000;

const patientSelect = { select: { id: true, fullName: true, cin: true } };

// Règle métier : pas 2 RDV confirmés du même patient à moins de 30 min
async function assertNoConfirmedConflict(patientId: string, date: Date, excludeId?: string) {
  const conflict = await prisma.appointment.findFirst({
    where: {
      patientId,
      status: "confirmed",
      ...(excludeId ? { id: { not: excludeId } } : {}),
      appointmentDate: {
        gt: new Date(date.getTime() - WINDOW_MS),
        lt: new Date(date.getTime() + WINDOW_MS),
      },
    },
  });

  if (conflict) {
    throw new AppError(
      409,
      "Ce patient a déjà un rendez-vous confirmé dans une fenêtre de 30 minutes"
    );
  }
}

export async function createAppointment(
  data: {
    patientId: string;
    appointmentDate: Date;
    reason: string;
    notes?: string | null;
    status: AppointmentStatus;
  },
  userId: string
) {
  const patient = await prisma.patient.findFirst({
    where: { id: data.patientId, deletedAt: null },
  });
  if (!patient) throw new AppError(404, "Patient introuvable");

  if (data.status === "confirmed") {
    await assertNoConfirmedConflict(data.patientId, data.appointmentDate);
  }

  return prisma.appointment.create({
    data: { ...data, createdById: userId },
    include: { patient: patientSelect },
  });
}

export async function listAppointments(filters: {
  date?: string;
  status?: AppointmentStatus;
  patientId?: string;
}) {
  const where: any = {};

  if (filters.status) where.status = filters.status;
  if (filters.patientId) where.patientId = filters.patientId;

  if (filters.date) {
    const start = new Date(`${filters.date}T00:00:00.000Z`);
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
    where.appointmentDate = { gte: start, lt: end };
  }

  return prisma.appointment.findMany({
    where,
    orderBy: { appointmentDate: "asc" },
    include: { patient: patientSelect },
  });
}

export async function updateStatus(id: string, status: AppointmentStatus) {
  const appointment = await prisma.appointment.findUnique({ where: { id } });
  if (!appointment) throw new AppError(404, "Rendez-vous introuvable");

  if (status === "confirmed") {
    await assertNoConfirmedConflict(
      appointment.patientId,
      appointment.appointmentDate,
      appointment.id
    );
  }

  return prisma.appointment.update({
    where: { id },
    data: { status },
    include: { patient: patientSelect },
  });
}