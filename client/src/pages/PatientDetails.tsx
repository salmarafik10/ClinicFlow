import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Phone, IdCard, Cake, MapPin } from "lucide-react";
import { api } from "../api/axios";
import StatusBadge from "../components/StatusBadge";
import type { PatientWithAppointments } from "../types";

export default function PatientDetails() {
  const { id } = useParams();
  const [patient, setPatient] = useState<PatientWithAppointments | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/patients/${id}`)
      .then((res) => setPatient(res.data))
      .catch((err) => setError(err.response?.data?.message ?? "Erreur de chargement"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-slate-500">Chargement...</p>;

  if (error || !patient) {
    return (
      <div>
        <div className="mb-4 rounded-xl bg-red-50 text-red-700 text-sm px-4 py-3">{error || "Patient introuvable"}</div>
        <Link to="/patients" className="text-blue-600 hover:underline text-sm">Retour aux patients</Link>
      </div>
    );
  }

  const infos = [
    { icon: IdCard, label: "CIN", value: patient.cin },
    { icon: Phone, label: "Téléphone", value: patient.phone },
    { icon: Cake, label: "Naissance", value: new Date(patient.birthDate).toLocaleDateString("fr-FR") },
    { icon: MapPin, label: "Adresse", value: patient.address ?? "Non renseignée" },
  ];

  return (
    <div>
      <Link to="/patients" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 mb-4">
        <ArrowLeft size={16} /> Retour aux patients
      </Link>

      <h1 className="text-2xl sm:text-3xl font-bold text-blue-600 mb-6">{patient.fullName}</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {infos.map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-2xl bg-white p-5 shadow-sm flex items-center gap-4">
            <span className="grid place-items-center w-11 h-11 rounded-xl bg-blue-100 text-blue-600">
              <Icon size={20} />
            </span>
            <div className="min-w-0">
              <p className="text-xs text-slate-500">{label}</p>
              <p className="font-semibold text-slate-800 truncate">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-bold text-slate-800 mb-3">
        Rendez-vous ({patient.appointments.length})
      </h2>

      <div className="rounded-2xl bg-white shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b border-slate-100">
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium">Motif</th>
              <th className="px-5 py-3 font-medium hidden md:table-cell">Notes</th>
              <th className="px-5 py-3 font-medium">Statut</th>
            </tr>
          </thead>
          <tbody>
            {patient.appointments.length === 0 ? (
              <tr><td colSpan={4} className="px-5 py-10 text-center text-slate-400">Aucun rendez-vous</td></tr>
            ) : (
              patient.appointments.map((a) => (
                <tr key={a.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-5 py-3 whitespace-nowrap">
                    {new Date(a.appointmentDate).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}
                  </td>
                  <td className="px-5 py-3 font-medium text-slate-800">{a.reason}</td>
                  <td className="px-5 py-3 hidden md:table-cell text-slate-500">{a.notes ?? "-"}</td>
                  <td className="px-5 py-3"><StatusBadge status={a.status} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}