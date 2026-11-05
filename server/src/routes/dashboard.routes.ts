import { Router } from "express";
import * as controller from "../controllers/dashboard.controller";
import { authenticate } from "../middlewares/auth";

const router = Router();

router.use(authenticate);
router.get("/stats", controller.stats);

export default router;