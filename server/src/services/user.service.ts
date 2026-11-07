import bcrypt from "bcrypt";
import { Role } from "@prisma/client";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";

const select = { id: true, email: true, fullName: true, role: true, isActive: true, createdAt: true };

export async function listUsers() {
  return prisma.user.findMany({ select, orderBy: { createdAt: "asc" } });
}

export async function createUser(data: { fullName: string; email: string; password: string; role: Role }) {
  const passwordHash = await bcrypt.hash(data.password, 10);
  return prisma.user.create({
    data: { fullName: data.fullName, email: data.email, role: data.role, passwordHash },
    select,
  });
}

export async function updateUser(
  id: string,
  data: { fullName?: string; role?: Role; isActive?: boolean },
  currentUserId: string
) {
  if (id === currentUserId && (data.isActive === false || data.role === "staff")) {
    throw new AppError(400, "Vous ne pouvez pas vous désactiver ou vous rétrograder vous-même");
  }
  const exists = await prisma.user.findUnique({ where: { id } });
  if (!exists) throw new AppError(404, "Utilisateur introuvable");
  return prisma.user.update({ where: { id }, data, select });
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, "Utilisateur introuvable");

  const ok = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!ok) throw new AppError(400, "Mot de passe actuel incorrect");

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
}