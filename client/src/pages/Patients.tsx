import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Pencil, Trash2, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import PatientModal from "../components/PatientModal";
import type { Patient, Pagination } from "../types";

const LIMIT = 8;

export default function Patients() {
  const { user } = useAuth();
  const [items, setItems] = useState<Patient[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState<{ open: boolean; patient: Patient | null }>({ open: false, patient: null });

  // Debounce de la recherche
  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get("/patients", { params: { search: debounced || undefined, page, limit: LIMIT } });
      setItems(data.items);
      setPagination(data.pagination);
      setError("");
    } catch {
      setError("Impossible de charger les patients");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [debounced, page]);

  async function handleDelete(p: Patient) {
    if (!confirm(`Supprimer le patient ${p.fullName} ?`)) return;
    try {
      await api.delete(`/patients/${p.id}`);
      load();
    } catch (err: any) {
      alert(err.response?.data?.message ?? "Suppression impossible");
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-blue-600">Patients</h1>
          <p className="text-slate-500 mt-1">{pagination?.total ?? 0} patient(s)</p>
        </div>
        <button
          onClick={() => setModal({ open: true, patient: null })}
          className="flex items-center gap-2 rounded-full bg-gradient-to-b from-blue-500 to-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/30"
        >
          <Plus size={18} /> Nouveau patient
        </button>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par nom ou CIN"
          className="w-full rounded-full border border-slate-200 bg-white pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {error && <div className="mb-4 rounded-xl bg-red-50 text-red-700 text-sm px-4 py-3">{error}</div>}

      <div className="rounded-2xl bg-white shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b border-slate-100">
              <th className="px-5 py-3 font-medium">Nom</th>
              <th className="px-5 py-3 font-medium">CIN</th>
              <th className="px-5 py-3 font-medium">Téléphone</th>
              <th className="px-5 py-3 font-medium hidden md:table-cell">Naissance</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-400">Chargement...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-400">Aucun patient trouvé</td></tr>
            ) : (
              items.map((p) => (
                <tr key={p.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-800">{p.fullName}</td>
                  <td className="px-5 py-3">{p.cin}</td>
                  <td className="px-5 py-3">{p.phone}</td>
                  <td className="px-5 py-3 hidden md:table-cell">{new Date(p.birthDate).toLocaleDateString("fr-FR")}</td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1">
                      <Link to={`/patients/${p.id}`} title="Détails" className="grid place-items-center w-9 h-9 rounded-full text-slate-500 hover:bg-blue-50 hover:text-blue-600">
                        <Eye size={17} />
                      </Link>
                      <button onClick={() => setModal({ open: true, patient: p })} title="Modifier" className="grid place-items-center w-9 h-9 rounded-full text-slate-500 hover:bg-amber-50 hover:text-amber-600">
                        <Pencil size={17} />
                      </button>
                      {user?.role === "admin" && (
                        <button onClick={() => handleDelete(p)} title="Supprimer" className="grid place-items-center w-9 h-9 rounded-full text-slate-500 hover:bg-red-50 hover:text-red-600">
                          <Trash2 size={17} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-slate-500">Page {pagination.page} sur {pagination.totalPages}</p>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="grid place-items-center w-10 h-10 rounded-full bg-white shadow-sm disabled:opacity-40"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="grid place-items-center w-10 h-10 rounded-full bg-white shadow-sm disabled:opacity-40"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {modal.open && (
        <PatientModal
          patient={modal.patient}
          onClose={() => setModal({ open: false, patient: null })}
          onSaved={() => {
            setModal({ open: false, patient: null });
            load();
          }}
        />
      )}
    </div>
  );
}