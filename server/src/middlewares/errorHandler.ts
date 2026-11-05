import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError";

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ message: "Route introuvable" });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "Données invalides",
      details: err.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message, details: err.details });
  }

  // Violation de la contrainte EXCLUDE (RDV confirmés trop proches) - filet de sécurité
  const code = (err as any)?.code ?? (err as any)?.cause?.code;
  if (code === "23P01") {
    return res.status(409).json({
      message: "Ce patient a déjà un rendez-vous confirmé dans une fenêtre de 30 minutes",
    });
  }
  // Doublon unique (ex. CIN, email)
  if (code === "23505" || (err as any)?.code === "P2002") {
    return res.status(409).json({ message: "Cette valeur existe déjà (doublon)" });
  }

  console.error(err);
  res.status(500).json({ message: "Erreur interne du serveur" });
}