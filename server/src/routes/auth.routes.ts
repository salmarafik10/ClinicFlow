import { Router } from "express";
import rateLimit from "express-rate-limit";
import * as authController from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth";

const router = Router();

// Limite stricte sur le login (anti brute-force)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  message: { message: "Trop de tentatives, réessayez plus tard" },
});

router.post("/login", loginLimiter, authController.login);
router.get("/me", authenticate, authController.me);

export default router;