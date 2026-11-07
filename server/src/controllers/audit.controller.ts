import { Request, Response } from "express";
import { listPatientsSchema } from "../validators/patient.validator";
import * as service from "../services/audit.service";

export async function list(req: Request, res: Response) {
  const { page, limit } = listPatientsSchema.parse(req.query);
  res.json(await service.listAuditLogs(page, limit));
}