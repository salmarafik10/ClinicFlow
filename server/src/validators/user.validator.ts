import { z } from "zod";

export const createUserSchema = z.object({
  fullName: z.string().trim().min(2).max(150),
  email: z.string().trim().toLowerCase().email("Email invalide"),
  password: z
    .string()
    .min(8, "8 caractères minimum")
    .regex(/[A-Z]/, "Une majuscule requise")
    .regex(/[0-9]/, "Un chiffre requis"),
  role: z.enum(["admin", "staff"]).default("staff"),
});

export const updateUserSchema = z.object({
  fullName: z.string().trim().min(2).max(150).optional(),
  role: z.enum(["admin", "staff"]).optional(),
  isActive: z.boolean().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Mot de passe actuel requis"),
  newPassword: z
    .string()
    .min(8, "8 caractères minimum")
    .regex(/[A-Z]/, "Une majuscule requise")
    .regex(/[0-9]/, "Un chiffre requis"),
});