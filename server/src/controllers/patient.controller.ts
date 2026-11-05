import { Request, Response } from "express";
import * as service from "../services/patient.service";
import {
  createPatientSchema,
  updatePatientSchema,
  listPatientsSchema,
  idParamSchema,
} from "../validators/patient.validator";

export async function create(req: Request, res: Response) {
  const data = createPatientSchema.parse(req.body);
  res.status(201).json(await service.createPatient(data));
}

export async function list(req: Request, res: Response) {
  const { search, page, limit } = listPatientsSchema.parse(req.query);
  res.json(await service.listPatients(search, page, limit));
}

export async function getOne(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  res.json(await service.getPatient(id));
}

export async function update(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  const data = updatePatientSchema.parse(req.body);
  res.json(await service.updatePatient(id, data));
}

export async function remove(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  await service.deletePatient(id);
  res.status(204).send();
}