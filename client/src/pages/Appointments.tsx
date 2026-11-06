import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { api } from "../api/axios";
import AppointmentModal from "../components/AppointmentModal";
import StatusBadge from "../components/StatusBadge";
import type { Appointment, AppointmentStatus } from "../types";

export default function Appointments() {
  const [items, setItems] = useState<Appointment[]>([]);
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get("/appointments", {
        params: { date: date || undefined, status: status || undefined },
      });
      setItems(data);
      setError("");
    } catch {
      setError("Impossible de charger les rendez-vous");
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
      setError("");
      load();
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Impossible de modifier le statut");
    }
  }

  const selectClass =
    "rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-blue-600">Rendez-vous</h1>
          <p className="text-slate-500 mt-1">{items.length} rendez-vous</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-full bg-gradient-to-b from-blue-500 to-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/30"
        >
          <Plus size={18} /> Nouveau rendez-vous
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={selectClass} />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectClass}>
          <option value="">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="confirmed">Confirmé</option>
          <option value="cancelled">Annulé</option>
        </select>
        {(date || status) && (
          <button
            onClick={() => {
              setDate("");
              setStatus("");
            }}
            className="rounded-full bg-slate-100 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-200"
          >
            Réinitialiser
          </button>
        )}
      </div>

      {error && <div className="mb-4 rounded-xl bg-red-50 text-red-700 text-sm px-4 py-3">{error}</div>}

      <div className="rounded-2xl bg-white shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b border-slate-100">
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium">Patient</th>
              <th className="px-5 py-3 font-medium hidden md:table-cell">Motif</th>
              <th className="px-5 py-3 font-medium">Statut</th>
              <th className="px-5 py-3 font-medium text-right">Changer le statut</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-400">Chargement...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-400">Aucun rendez-vous</td></tr>
            ) : (
              items.map((a) => (
                <tr key={a.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                  <td className="px-5 py-3 whitespace-nowrap">
                    {new Date(a.appointmentDate).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}
                  </td>
                  <td className="px-5 py-3 font-medium">
                    <Link to={`/patients/${a.patientId}`} className="text-slate-800 hover:text-blue-600">
                      {a.patient?.fullName}
                    </Link>
                  </td>
                  <td className="px-5 py-3 hidden md:table-cell text-slate-500">{a.reason}</td>
                  <td className="px-5 py-3"><StatusBadge status={a.status} /></td>
                  <td className="px-5 py-3 text-right">
                    <select
                      value={a.status}
                      onChange={(e) => changeStatus(a.id, e.target.value as AppointmentStatus)}
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs"
                    >
                      <option value="pending">En attente</option>
                      <option value="confirmed">Confirmé</option>
                      <option value="cancelled">Annulé</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <AppointmentModal
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false);
            load();
          }}
        />
      )}
    </div>
  );
}