import { Request, Response } from "express";
import * as service from "../services/appointment.service";
import { idParamSchema } from "../validators/patient.validator";
import {
  createAppointmentSchema,
  listAppointmentsSchema,
  updateStatusSchema,
} from "../validators/appointment.validator";

export async function create(req: Request, res: Response) {
  const data = createAppointmentSchema.parse(req.body);
  res.status(201).json(await service.createAppointment(data, req.user!.id));
}

export async function list(req: Request, res: Response) {
  const filters = listAppointmentsSchema.parse(req.query);
  res.json(await service.listAppointments(filters));
}

export async function patchStatus(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  const { status } = updateStatusSchema.parse(req.body);
  res.json(await service.updateStatus(id, status));
}