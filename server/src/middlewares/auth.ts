import { NextFunction, Request, Response } from "express";
import { Role } from "@prisma/client";
import { AppError } from "../utils/AppError";
import { verifyToken } from "../utils/jwt";

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    throw new AppError(401, "Token manquant");
  }

  try {
    const payload = verifyToken(header.slice(7));
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    throw new AppError(401, "Token invalide ou expiré");
  }
}

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) throw new AppError(401, "Non authentifié");
    if (!roles.includes(req.user.role)) throw new AppError(403, "Accès refusé");
    next();
  };
}