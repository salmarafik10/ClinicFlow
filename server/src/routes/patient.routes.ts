import { Router } from "express";
import * as controller from "../controllers/patient.controller";
import { authenticate, requireRole } from "../middlewares/auth";

const router = Router();

router.use(authenticate);

router.post("/", controller.create);
router.get("/", controller.list);
router.get("/:id", controller.getOne);
router.put("/:id", controller.update);
router.get("/deleted", requireRole("admin"), controller.listDeleted);
router.delete("/:id", requireRole("admin"), controller.remove);

export default router;