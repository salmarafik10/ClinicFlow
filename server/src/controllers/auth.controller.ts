import { Request, Response } from "express";
import { loginSchema } from "../validators/auth.validator";
import * as authService from "../services/auth.service";

export async function login(req: Request, res: Response) {
  const input = loginSchema.parse(req.body);
  const result = await authService.login(input);
  res.json(result);
}

export async function me(req: Request, res: Response) {
  const user = await authService.getMe(req.user!.id);
  res.json(user);
}