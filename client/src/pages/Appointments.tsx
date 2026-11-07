import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, CalendarX, Pencil, List, CalendarDays, Download } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "../api/axios";
import AppointmentModal from "../components/AppointmentModal";
import StatusBadge from "../components/StatusBadge";
import EmptyState from "../components/EmptyState";
import { ListSkeleton } from "../components/Skeleton";
import type { Appointment, AppointmentStatus } from "../types";
import WeekCalendar, { startOfWeek } from "../components/WeekCalendar";
import { downloadCsv } from "../utils/csv";
import Select from "../components/Select";
import ActionButton from "../components/ActionButtons";

const fmt = (d: string) =>
  new Date(d).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });

const STATUS_FILTER = [
  { value: "", label: "Tous les statuts" },
  { value: "pending", label: "En attente" },
  { value: "confirmed", label: "Confirmé" },
  { value: "cancelled", label: "Annulé" },
];
const STATUS_EDIT = STATUS_FILTER.slice(1);

export default function Appointments() {
  const [items, setItems] = useState<Appointment[]>([]);
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Appointment | null>(null);
  const [view, setView] = useState<"list" | "calendar">("list");
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date()));

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get("/appointments", {
        params: { date: date || undefined, status: status || undefined },
      });
      setItems(data);
    } catch {
      toast.error("Impossible de charger les rendez-vous");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [date, status]);

  async function changeStatus(id: string, newStatus: AppointmentStatus) {
    try {
      await api.patch(`/appointments/${id}/status`, { status: newStatus });
      toast.success("Statut mis à jour");
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Impossible de modifier le statut");
    } finally {
      load();
    }
  }

  const statusSelect = (a: Appointment) => (
    <div className="flex items-center gap-2 md:justify-end">
      <Select
        size="sm"
        align="right"
        value={a.status}
        options={STATUS_EDIT}
        onChange={(v) => changeStatus(a.id, v as AppointmentStatus)}
        className="w-36"
      />
      <button
        onClick={() => setEditing(a)}
        title="Modifier"
        className="grid place-items-center w-8 h-8 rounded-full text-slate-500 hover:bg-amber-50 hover:text-amber-600"
      >
        <Pencil size={16} />
      </button>
    </div>
  );

  const addButton = (
    <button
      onClick={() => setModalOpen(true)}
      className="flex items-center gap-2 rounded-full bg-gradient-to-b from-blue-500 to-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/30"
    >
      <Plus size={18} /> Nouveau rendez-vous
    </button>
  );

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-600">Rendez-vous</h1>
          <p className="text-slate-500 mt-1">{items.length} rendez-vous</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <ActionButton
            icon={Download}
            label="Exporter CSV"
            variant="ghost"
            onClick={() =>
              downloadCsv("rendez-vous.csv", [
                ["Date", "Patient", "CIN", "Motif", "Statut", "Notes"],
                ...items.map((a) => [
                  new Date(a.appointmentDate).toLocaleString("fr-FR"),
                  a.patient?.fullName, a.patient?.cin, a.reason, a.status, a.notes,
                ]),
              ])
            }
          />
          <ActionButton icon={Plus} label="Nouveau rendez-vous" onClick={() => setModalOpen(true)} />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:items-center gap-2 sm:gap-3 mb-4">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="col-span-1 w-full sm:w-auto rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
        />
        <Select value={status} options={STATUS_FILTER} onChange={setStatus} className="col-span-1 sm:w-52" />
        {(date || status) && (
          <button
            onClick={() => {
              setDate("");
              setStatus("");
            }}
            className="col-span-2 sm:col-span-1 rounded-full bg-slate-100 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200"
          >
            Réinitialiser
          </button>
        )}
      </div>

      <div className="inline-flex rounded-full bg-slate-100 p-1 mb-4">
        {([["list", "Liste", List], ["calendar", "Calendrier", CalendarDays]] as const).map(([key, label, Icon]) => (
          <button
            key={key}
            onClick={() => setView(key)}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${view === key ? "bg-white shadow text-blue-600" : "text-slate-500"}`}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>
      {view === "calendar" ? (
  <WeekCalendar
    appointments={items}
    weekStart={weekStart}
    onWeekChange={setWeekStart}
    onSelect={(a) => setEditing(a)}
  />
) : (

      <div className="rounded-2xl bg-white shadow-sm">
        {loading ? (
          <ListSkeleton />
        ) : items.length === 0 ? (
          <EmptyState
            icon={CalendarX}
            title="Aucun rendez-vous"
            description={date || status ? "Aucun résultat pour ces filtres." : "Créez le premier rendez-vous."}
            action={!(date || status) && addButton}
          />
        ) : (
          <>
            <table className="hidden md:table w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-100">
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Patient</th>
                  <th className="px-5 py-3 font-medium">Motif</th>
                  <th className="px-5 py-3 font-medium">Statut</th>
                  <th className="px-5 py-3 font-medium text-right">Changer le statut</th>
                </tr>
              </thead>
              <tbody>
                {items.map((a) => (
                  <tr key={a.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                    <td className="px-5 py-3 whitespace-nowrap">{fmt(a.appointmentDate)}</td>
                    <td className="px-5 py-3 font-medium">
                      <Link to={`/patients/${a.patientId}`} className="text-slate-800 hover:text-blue-600">
                        {a.patient?.fullName}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-slate-500">{a.reason}</td>
                    <td className="px-5 py-3"><StatusBadge status={a.status} /></td>
                    <td className="px-5 py-3 text-right">{statusSelect(a)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <ul className="md:hidden divide-y divide-slate-100">
              {items.map((a) => (
                <li key={a.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <Link to={`/patients/${a.patientId}`} className="font-semibold text-slate-800 truncate">
                      {a.patient?.fullName}
                    </Link>
                    <StatusBadge status={a.status} />
                  </div>
                  <p className="text-sm text-slate-600">{fmt(a.appointmentDate)}</p>
                  <p className="text-sm text-slate-500">{a.reason}</p>
                  <div>{statusSelect(a)}</div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      )}

     {(modalOpen || editing) && (
  <AppointmentModal
    appointment={editing}
    onClose={() => {
      setModalOpen(false);
      setEditing(null);
    }}
    onSaved={() => {
      toast.success(editing ? "Rendez-vous modifié" : "Rendez-vous créé");
      setModalOpen(false);
      setEditing(null);
      load();
    }}
  />
)}
    </div>
  );
}