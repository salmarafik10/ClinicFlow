import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";

export async function logAction(
  userId: string | undefined,
  action: string,
  entity: "patient" | "appointment",
  entityId: string,
  metadata?: Prisma.InputJsonValue
) {
  try {
    await prisma.auditLog.create({
      data: { userId, action, entity, entityId, metadata },
    });
  } catch (err) {
    // Un échec d'audit ne doit jamais bloquer l'action principale
    console.error("Audit log error:", err);
  }
}

export async function listAuditLogs(page: number, limit: number) {
  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { user: { select: { id: true, fullName: true, role: true } } },
    }),
    prisma.auditLog.count(),
  ]);

  return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}