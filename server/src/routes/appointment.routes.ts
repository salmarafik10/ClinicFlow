import { Router } from "express";
import * as controller from "../controllers/appointment.controller";
import { authenticate } from "../middlewares/auth";

const router = Router();

router.use(authenticate);

router.post("/", controller.create);
router.get("/", controller.list);
router.patch("/:id/status", controller.patchStatus);

export default router;