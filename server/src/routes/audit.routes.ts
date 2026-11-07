import { Router } from "express";
import * as controller from "../controllers/audit.controller";
import { authenticate, requireRole } from "../middlewares/auth";

const router = Router();

router.use(authenticate, requireRole("admin"));
router.get("/", controller.list);

export default router;