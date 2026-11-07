import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, CalendarDays, Clock, CheckCircle2, CalendarX } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { api } from "../api/axios";
import { Skeleton } from "../components/Skeleton";
import EmptyState from "../components/EmptyState";

interface Stats {
  totalPatients: number;
  todayAppointments: number;
  pending: number;
  confirmed: number;
  cancelled: number;
  perDay: { date: string; count: number }[];
  upcoming: { id: string; appointmentDate: string; reason: string; status: string; patient: { id: string; fullName: string } }[];
}

const COLORS = ["#f59e0b", "#10b981", "#ef4444"];

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

  const chartDays = stats?.perDay.map((d) => ({
    day: new Date(d.date).toLocaleDateString("fr-FR", { weekday: "short", timeZone: "UTC" }),
    count: d.count,
  }));

  const pie = stats
    ? [
        { name: "En attente", value: stats.pending },
        { name: "Confirmés", value: stats.confirmed },
        { name: "Annulés", value: stats.cancelled },
      ]
    : [];

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-blue-600">Dashboard</h1>
      <p className="text-slate-500 dark:text-slate-400 mt-1 mb-6">Vue d'ensemble de votre clinique</p>

      {error && <div className="mb-4 rounded-xl bg-red-50 text-red-700 text-sm px-4 py-3">{error}</div>}

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl bg-white dark:bg-slate-800 p-4 sm:p-5 shadow-sm flex items-center gap-3 sm:gap-4">
            <span className={`grid place-items-center w-11 h-11 sm:w-12 sm:h-12 shrink-0 rounded-xl ${color}`}>
              <Icon size={22} />
            </span>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate">{label}</p>
              {stats ? (
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
              ) : (
                <Skeleton className="h-7 w-10 mt-1" />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 mt-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-slate-800 p-5 shadow-sm">
          <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-4">Rendez-vous des 7 derniers jours</h2>
          <div className="h-64">
            {stats ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartDays}>
                  <XAxis dataKey="day" tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} />
                  <Tooltip cursor={{ fill: "#eff6ff" }} />
                  <Bar dataKey="count" name="Rendez-vous" fill="#2563eb" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Skeleton className="h-full w-full" />
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-slate-800 p-5 shadow-sm">
          <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-4">Répartition par statut</h2>
          <div className="h-64">
            {stats ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pie} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                    {pie.map((_, i) => (
                      <Cell key={i} fill={COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Skeleton className="h-full w-full" />
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-3 text-xs text-slate-600 dark:text-slate-400">
            {pie.map((p, i) => (
              <span key={p.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i] }} />
                {p.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white dark:bg-slate-800 p-5 shadow-sm mt-4">
        <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-3">Prochains rendez-vous d'aujourd'hui</h2>
        {!stats ? (
          <Skeleton className="h-16 w-full" />
        ) : stats.upcoming.length === 0 ? (
          <EmptyState icon={CalendarX} title="Aucun rendez-vous à venir aujourd'hui" />
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-700">
            {stats.upcoming.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <Link to={`/patients/${a.patient.id}`} className="font-medium text-slate-800 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 truncate block">
                    {a.patient.fullName}
                  </Link>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{a.reason}</p>
                </div>
                <span className="shrink-0 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-sm font-semibold px-3 py-1">
                  {new Date(a.appointmentDate).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}