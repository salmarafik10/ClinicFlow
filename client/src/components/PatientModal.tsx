import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { api } from "../api/axios";
import type { Patient } from "../types";

interface Props {
  patient: Patient | null; // null = création
  onClose: () => void;
  onSaved: () => void;
}

const inputClass =
  "w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

export default function PatientModal({ patient, onClose, onSaved }: Props) {
  const [form, setForm] = useState({
    fullName: patient?.fullName ?? "",
    cin: patient?.cin ?? "",
    phone: patient?.phone ?? "",
    birthDate: patient?.birthDate?.slice(0, 10) ?? "",
    address: patient?.address ?? "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = { ...form, address: form.address || null };
      if (patient) await api.put(`/patients/${patient.id}`, payload);
      else await api.post("/patients", payload);
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
          <h2 className="text-lg font-bold text-slate-800">
            {patient ? "Modifier le patient" : "Nouveau patient"}
          </h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        {error && <div className="mb-3 rounded-xl bg-red-50 text-red-700 text-sm px-3 py-2">{error}</div>}

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Nom complet</label>
            <input className={inputClass} required value={form.fullName} onChange={(e) => set("fullName", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">CIN</label>
              <input className={inputClass} required value={form.cin} onChange={(e) => set("cin", e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Téléphone</label>
              <input className={inputClass} required value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date de naissance</label>
            <input type="date" className={inputClass} required value={form.birthDate} onChange={(e) => set("birthDate", e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Adresse (optionnel)</label>
            <input className={inputClass} value={form.address} onChange={(e) => set("address", e.target.value)} />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button type="button" onClick={onClose} className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200">
            Annuler
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-gradient-to-b from-blue-500 to-blue-700 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </form>
    </div>
  );
}