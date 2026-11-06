import { FormEvent, useEffect, useState } from "react";
import { X } from "lucide-react";
import { api } from "../api/axios";
import type { Patient, AppointmentStatus } from "../types";

interface Props {
  onClose: () => void;
  onSaved: () => void;
}

const inputClass =
  "w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

export default function AppointmentModal({ onClose, onSaved }: Props) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [form, setForm] = useState({
    patientId: "",
    appointmentDate: "",
    reason: "",
    notes: "",
    status: "pending" as AppointmentStatus,
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get("/patients", { params: { page: 1, limit: 100 } })
      .then((res) => setPatients(res.data.items))
      .catch(() => setError("Impossible de charger les patients"));
  }, []);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.post("/appointments", {
        ...form,
        appointmentDate: new Date(form.appointmentDate).toISOString(),
        notes: form.notes || null,
      });
      onSaved();
    } catch (err: any) {
      const data = err.response?.data;
      setError(data?.details?.[0]?.message ?? data?.message ?? "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  }

  return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 p-0 sm:p-4">
       <form onSubmit={handleSubmit} className="w-full sm:max-w-md max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">Nouveau rendez-vous</h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        {error && <div className="mb-3 rounded-xl bg-red-50 text-red-700 text-sm px-3 py-2">{error}</div>}

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Patient</label>
            <select className={inputClass} required value={form.patientId} onChange={(e) => set("patientId", e.target.value)}>
              <option value="">Choisir un patient</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.fullName} ({p.cin})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date et heure</label>
            <input type="datetime-local" className={inputClass} required value={form.appointmentDate} onChange={(e) => set("appointmentDate", e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Motif</label>
            <input className={inputClass} required value={form.reason} onChange={(e) => set("reason", e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Statut</label>
            <select className={inputClass} value={form.status} onChange={(e) => set("status", e.target.value)}>
              <option value="pending">En attente</option>
              <option value="confirmed">Confirmé</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes (optionnel)</label>
            <textarea className={inputClass} rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button type="button" onClick={onClose} className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200">
            Annuler
          </button>
          <button type="submit" disabled={saving} className="rounded-xl bg-gradient-to-b from-blue-500 to-blue-700 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </form>
    </div>
  );
}