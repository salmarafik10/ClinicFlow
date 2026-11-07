import { Router } from "express";
import * as controller from "../controllers/user.controller";
import { authenticate, requireRole } from "../middlewares/auth";

const router = Router();

router.use(authenticate);

// Tout utilisateur connecté
router.put("/me/password", controller.changePassword);

// Admin uniquement
router.get("/", requireRole("admin"), controller.list);
router.post("/", requireRole("admin"), controller.create);
router.patch("/:id", requireRole("admin"), controller.update);

export default router;