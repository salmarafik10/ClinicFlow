import { z } from "zod";

export const createPatientSchema = z.object({
  fullName: z.string().trim().min(2).max(150),
  cin: z.string().trim().toUpperCase().min(4).max(20),
  phone: z.string().trim().regex(/^[0-9+\s-]{8,20}$/, "Téléphone invalide"),
  birthDate: z.coerce.date().max(new Date(), "Date de naissance dans le futur"),
  address: z.string().trim().max(255).optional().nullable(),
});

export const updatePatientSchema = createPatientSchema.partial();

export const listPatientsSchema = z.object({
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const idParamSchema = z.object({
  id: z.string().uuid("ID invalide"),
});