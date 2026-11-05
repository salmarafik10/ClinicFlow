import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";

export async function createPatient(data: any) {
  return prisma.patient.create({ data });
}

export async function listPatients(search: string | undefined, page: number, limit: number) {
  const where = {
    deletedAt: null,
    ...(search
      ? {
          OR: [
            { fullName: { contains: search, mode: "insensitive" as const } },
            { cin: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.patient.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.patient.count({ where }),
  ]);

  return {
    items,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getPatient(id: string) {
  const patient = await prisma.patient.findFirst({
    where: { id, deletedAt: null },
    include: { appointments: { orderBy: { appointmentDate: "desc" } } },
  });
  if (!patient) throw new AppError(404, "Patient introuvable");
  return patient;
}

export async function updatePatient(id: string, data: any) {
  await getPatient(id);
  return prisma.patient.update({ where: { id }, data });
}

// Soft delete
export async function deletePatient(id: string) {
  await getPatient(id);
  await prisma.patient.update({ where: { id }, data: { deletedAt: new Date() } });
}