import { Request, Response } from "express";
import * as service from "../services/dashboard.service";

export async function stats(_req: Request, res: Response) {
  res.json(await service.getStats());
}