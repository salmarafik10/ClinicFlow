import bcrypt from "bcrypt";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";
import { signToken } from "../utils/jwt";
import { LoginInput } from "../validators/auth.validator";

// Hash factice : on compare toujours, même si l'email n'existe pas (anti timing attack)
const DUMMY_HASH = "$2b$10$CwTycUXWue0Thq9StjUM0uJ8.WqfqQ5q0bGZfK8v3kzK7d3p0xH9y";

export async function login({ email, password }: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email } });

  const valid = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);

  if (!user || !valid || !user.isActive) {
    throw new AppError(401, "Email ou mot de passe incorrect");
  }

  const token = signToken({ sub: user.id, role: user.role });

  return {
    token,
    user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role },
  };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, fullName: true, role: true, isActive: true },
  });

  if (!user || !user.isActive) throw new AppError(401, "Utilisateur introuvable ou désactivé");
  return user;
}