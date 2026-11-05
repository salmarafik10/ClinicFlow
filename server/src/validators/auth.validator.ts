import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email invalide").toLowerCase().trim(),
  password: z.string().min(1, "Mot de passe requis"),
});

export type LoginInput = z.infer<typeof loginSchema>;