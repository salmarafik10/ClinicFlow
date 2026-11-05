import { prisma } from "../config/prisma";

export async function getStats() {
  const now = new Date();
  const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

  const [totalPatients, todayAppointments, pending, confirmed] = await Promise.all([
    prisma.patient.count({ where: { deletedAt: null } }),
    prisma.appointment.count({
      where: { appointmentDate: { gte: startOfDay, lt: endOfDay } },
    }),
    prisma.appointment.count({ where: { status: "pending" } }),
    prisma.appointment.count({ where: { status: "confirmed" } }),
  ]);

  return { totalPatients, todayAppointments, pending, confirmed };
}