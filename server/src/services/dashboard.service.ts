import { prisma } from "../config/prisma";

const DAY = 24 * 60 * 60 * 1000;

export async function getStats() {
  const now = new Date();
  const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const endOfDay = new Date(startOfDay.getTime() + DAY);
  const weekStart = new Date(startOfDay.getTime() - 6 * DAY);

  const [totalPatients, todayAppointments, pending, confirmed, cancelled, week, upcoming] =
    await Promise.all([
      prisma.patient.count({ where: { deletedAt: null } }),
      prisma.appointment.count({ where: { appointmentDate: { gte: startOfDay, lt: endOfDay } } }),
      prisma.appointment.count({ where: { status: "pending" } }),
      prisma.appointment.count({ where: { status: "confirmed" } }),
      prisma.appointment.count({ where: { status: "cancelled" } }),
      prisma.appointment.findMany({
        where: { appointmentDate: { gte: weekStart, lt: endOfDay } },
        select: { appointmentDate: true },
      }),
      prisma.appointment.findMany({
        where: { appointmentDate: { gte: now, lt: endOfDay }, status: { not: "cancelled" } },
        orderBy: { appointmentDate: "asc" },
        take: 5,
        include: { patient: { select: { id: true, fullName: true } } },
      }),
    ]);

  // Rendez-vous par jour (7 derniers jours)
  const perDay = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart.getTime() + i * DAY);
    const key = d.toISOString().slice(0, 10);
    return { date: key, count: 0 };
  });
  for (const a of week) {
    const key = a.appointmentDate.toISOString().slice(0, 10);
    const row = perDay.find((r) => r.date === key);
    if (row) row.count++;
  }

  return {
    totalPatients,
    todayAppointments,
    pending,
    confirmed,
    cancelled,
    perDay,
    upcoming,
  };
}