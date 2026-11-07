export interface Patient {
  id: string;
  fullName: string;
  cin: string;
  phone: string;
  birthDate: string;
  address: string | null;
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
export type AppointmentStatus = "pending" | "confirmed" | "cancelled";

export interface Appointment {
  id: string;
  patientId: string;
  appointmentDate: string;
  status: AppointmentStatus;
  reason: string;
  notes: string | null;
  createdAt: string;
  patient?: { id: string; fullName: string; cin: string };
}

export interface PatientWithAppointments extends Patient {
  appointments: Appointment[];
}

export interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  user: { id: string; fullName: string; role: "admin" | "staff" } | null;
}