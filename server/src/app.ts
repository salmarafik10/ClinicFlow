import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import { errorHandler, notFound } from "./middlewares/errorHandler";
import authRoutes from "./routes/auth.routes";
import patientRoutes from "./routes/patient.routes";
import appointmentRoutes from "./routes/appointment.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import auditRoutes from "./routes/audit.routes";
import userRoutes from "./routes/user.routes";


const app = express();

app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json());

// Limite les tentatives (anti brute-force) sur toute l'API
app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Les routes seront branchées ici :
app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/audit-logs", auditRoutes);
app.use("/api/users", userRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;