import { useEffect, useState } from "react";
import { Users, CalendarDays, Clock, CheckCircle2 } from "lucide-react";
import { api } from "../api/axios";

interface Stats {
  totalPatients: number;
  todayAppointments: number;
  pending: number;
  confirmed: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/dashboard/stats")
      .then((res) => setStats(res.data))
      .catch(() => setError("Impossible de charger les statistiques"));
  }, []);

  const cards = [
    { label: "Total patients", value: stats?.totalPatients, icon: Users, color: "bg-blue-100 text-blue-600" },
    { label: "Rendez-vous du jour", value: stats?.todayAppointments, icon: CalendarDays, color: "bg-violet-100 text-violet-600" },
    { label: "En attente", value: stats?.pending, icon: Clock, color: "bg-amber-100 text-amber-600" },
    { label: "Confirmés", value: stats?.confirmed, icon: CheckCircle2, color: "bg-emerald-100 text-emerald-600" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-blue-600">Dashboard</h1>
      <p className="text-slate-500 mt-1 mb-6">Vue d'ensemble de votre clinique</p>

      {error && <div className="mb-4 rounded-xl bg-red-50 text-red-700 text-sm px-4 py-3">{error}</div>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl bg-white p-5 shadow-sm flex items-center gap-4">
            <span className={`grid place-items-center w-12 h-12 rounded-xl ${color}`}>
              <Icon size={22} />
            </span>
            <div>
              <p className="text-sm text-slate-500">{label}</p>
              <p className="text-2xl font-bold text-slate-800">{value ?? "—"}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}