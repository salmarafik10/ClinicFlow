import { AppointmentStatus } from "@prisma/client";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";
import { logAction } from "./audit.service";

const WINDOW_MS = 30 * 60 * 1000;
const patientSelect = { select: { id: true, fullName: true, cin: true } };

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
    throw new AppError(409, "Ce patient a déjà un rendez-vous confirmé dans une fenêtre de 30 minutes");
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
  const patient = await prisma.patient.findFirst({ where: { id: data.patientId, deletedAt: null } });
  if (!patient) throw new AppError(404, "Patient introuvable");

  if (data.status === "confirmed") {
    await assertNoConfirmedConflict(data.patientId, data.appointmentDate);
  }

  const appointment = await prisma.appointment.create({
    data: { ...data, createdById: userId },
    include: { patient: patientSelect },
  });
  await logAction(userId, "CREATE", "appointment", appointment.id, {
    patient: patient.fullName,
    status: appointment.status,
  });
  return appointment;
}

export async function listAppointments(filters: {
  date?: string;
  status?: AppointmentStatus;
  patientId?: string;
  page?: number;
  limit?: number;
}) {
  const where: any = {};

  if (filters.status) where.status = filters.status;
  if (filters.patientId) where.patientId = filters.patientId;

  if (filters.date) {
    const start = new Date(`${filters.date}T00:00:00.000Z`);
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
    where.appointmentDate = { gte: start, lt: end };
  }

  if (filters.page) {
    const page = filters.page;
    const limit = filters.limit ?? 10;
    const [items, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        orderBy: { appointmentDate: "asc" },
        skip: (page - 1) * limit,
        take: limit,
        include: { patient: patientSelect },
      }),
      prisma.appointment.count({ where }),
    ]);
    return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  return prisma.appointment.findMany({
    where,
    orderBy: { appointmentDate: "asc" },
    include: { patient: patientSelect },
  });
}

export async function updateAppointment(
  id: string,
  data: { appointmentDate?: Date; reason?: string; notes?: string | null },
  userId: string
) {
  const existing = await prisma.appointment.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, "Rendez-vous introuvable");

  // Un RDV confirmé qui change d'heure doit respecter la règle des 30 minutes
  if (existing.status === "confirmed" && data.appointmentDate) {
    await assertNoConfirmedConflict(existing.patientId, data.appointmentDate, id);
  }

  const appointment = await prisma.appointment.update({
    where: { id },
    data,
    include: { patient: patientSelect },
  });
  await logAction(userId, "UPDATE", "appointment", id, { fields: Object.keys(data) });
  return appointment;
}

export async function updateStatus(id: string, status: AppointmentStatus, userId: string) {
  const appointment = await prisma.appointment.findUnique({ where: { id } });
  if (!appointment) throw new AppError(404, "Rendez-vous introuvable");

  if (status === "confirmed") {
    await assertNoConfirmedConflict(appointment.patientId, appointment.appointmentDate, appointment.id);
  }

  const updated = await prisma.appointment.update({
    where: { id },
    data: { status },
    include: { patient: patientSelect },
  });
  await logAction(userId, "STATUS_CHANGE", "appointment", id, { from: appointment.status, to: status });
  return updated;
}