import { z } from "zod";

const statusEnum = z.enum(["pending", "confirmed", "cancelled"]);

export const createAppointmentSchema = z.object({
  patientId: z.string().uuid("ID patient invalide"),
  appointmentDate: z.coerce.date(),
  reason: z.string().trim().min(2, "Motif requis").max(255),
  notes: z.string().trim().max(1000).optional().nullable(),
  status: statusEnum.default("pending"),
});

export const listAppointmentsSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format attendu : YYYY-MM-DD").optional(),
  status: statusEnum.optional(),
  patientId: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
});

export const updateStatusSchema = z.object({
  status: statusEnum,
});

export const updateAppointmentSchema = z.object({
  appointmentDate: z.coerce.date().optional(),
  reason: z.string().trim().min(2).max(255).optional(),
  notes: z.string().trim().max(1000).optional().nullable(),
});