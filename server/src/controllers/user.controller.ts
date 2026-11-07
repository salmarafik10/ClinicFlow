import { Request, Response } from "express";
import * as service from "../services/user.service";
import { idParamSchema } from "../validators/patient.validator";
import { createUserSchema, updateUserSchema, changePasswordSchema } from "../validators/user.validator";

export async function list(_req: Request, res: Response) {
  res.json(await service.listUsers());
}

export async function create(req: Request, res: Response) {
  const data = createUserSchema.parse(req.body);
  res.status(201).json(await service.createUser(data));
}

export async function update(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  const data = updateUserSchema.parse(req.body);
  res.json(await service.updateUser(id, data, req.user!.id));
}

export async function changePassword(req: Request, res: Response) {
  const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
  await service.changePassword(req.user!.id, currentPassword, newPassword);
  res.status(204).send();
}