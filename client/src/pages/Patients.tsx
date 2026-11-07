import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Pencil, Trash2, Eye, ChevronLeft, ChevronRight, Users, Phone, RotateCcw} from "lucide-react";
import toast from "react-hot-toast";
import { api } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import PatientModal from "../components/PatientModal";
import ConfirmModal from "../components/ConfirmModal";
import EmptyState from "../components/EmptyState";
import { ListSkeleton } from "../components/Skeleton";
import type { Patient, Pagination } from "../types";

const LIMIT = 8;

export default function Patients() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [items, setItems] = useState<Patient[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; patient: Patient | null }>({ open: false, patient: null });
  const [toDelete, setToDelete] = useState<Patient | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [deleted, setDeleted] = useState<Patient[]>([]);

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
    } catch {
      toast.error("Impossible de charger les patients");
    } finally {
      setLoading(false);
    }
  }

    async function loadDeleted() {
    try {
      const { data } = await api.get("/patients/deleted");
      setDeleted(data);
    } catch {
      toast.error("Impossible de charger les patients supprimés");
    }
  }

  async function restore(p: Patient) {
    try {
      await api.patch(`/patients/${p.id}/restore`);
      toast.success("Patient restauré");
      loadDeleted();
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Restauration impossible");
    }
  }

  useEffect(() => {
    load();
  }, [debounced, page]);

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/patients/${toDelete.id}`);
      toast.success("Patient supprimé");
      setToDelete(null);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Suppression impossible");
    } finally {
      setDeleting(false);
    }
  }

  const actions = (p: Patient) => (
    <div className="flex gap-1">
      <Link to={`/patients/${p.id}`} title="Détails" className="grid place-items-center w-9 h-9 rounded-full text-slate-500 hover:bg-blue-50 hover:text-blue-600">
        <Eye size={17} />
      </Link>
      <button onClick={() => setModal({ open: true, patient: p })} title="Modifier" className="grid place-items-center w-9 h-9 rounded-full text-slate-500 hover:bg-amber-50 hover:text-amber-600">
        <Pencil size={17} />
      </button>
      {isAdmin && (
        <button onClick={() => setToDelete(p)} title="Supprimer" className="grid place-items-center w-9 h-9 rounded-full text-slate-500 hover:bg-red-50 hover:text-red-600">
          <Trash2 size={17} />
        </button>
      )}
    </div>
  );

  const addButton = (
    <button
      onClick={() => setModal({ open: true, patient: null })}
      className="flex items-center gap-2 rounded-full bg-gradient-to-b from-blue-500 to-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/30"
    >
      <Plus size={18} /> Nouveau patient
    </button>
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-600">Patients</h1>
          <p className="text-slate-500 mt-1">{pagination?.total ?? 0} patient(s)</p>
        </div>
        {addButton}
      </div>

      <div className="relative mb-4 w-full sm:max-w-sm">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par nom ou CIN"
          className="w-full rounded-full border border-slate-200 bg-white pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
        {isAdmin && (
    <button
      onClick={() => {
        if (!showDeleted) loadDeleted();
        setShowDeleted(!showDeleted);
      }}
      className="mb-4 text-sm font-medium text-slate-500 hover:text-blue-600"
    >
      {showDeleted ? "Masquer" : "Voir"} les patients supprimés
    </button>
  )}

  {showDeleted && (
    <div className="rounded-2xl bg-white shadow-sm mb-4">
      {deleted.length === 0 ? (
        <p className="p-5 text-sm text-slate-400">Aucun patient supprimé</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {deleted.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-3 px-5 py-3">
              <div className="min-w-0">
                <p className="font-medium text-slate-800 truncate">{p.fullName}</p>
                <p className="text-xs text-slate-500">CIN : {p.cin}</p>
              </div>
              <button
                onClick={() => restore(p)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
              >
                <RotateCcw size={14} /> Restaurer
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )}

      <div className="rounded-2xl bg-white shadow-sm">
        {loading ? (
          <ListSkeleton />
        ) : items.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Aucun patient trouvé"
            description={debounced ? "Essayez une autre recherche." : "Ajoutez votre premier patient."}
            action={!debounced && addButton}
          />
        ) : (
          <>
            {/* Tableau (desktop) */}
            <table className="hidden md:table w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-100">
                  <th className="px-5 py-3 font-medium">Nom</th>
                  <th className="px-5 py-3 font-medium">CIN</th>
                  <th className="px-5 py-3 font-medium">Téléphone</th>
                  <th className="px-5 py-3 font-medium">Naissance</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                    <td className="px-5 py-3 font-medium text-slate-800">{p.fullName}</td>
                    <td className="px-5 py-3">{p.cin}</td>
                    <td className="px-5 py-3">{p.phone}</td>
                    <td className="px-5 py-3">{new Date(p.birthDate).toLocaleDateString("fr-FR")}</td>
                    <td className="px-5 py-3"><div className="flex justify-end">{actions(p)}</div></td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Cartes (mobile) */}
            <ul className="md:hidden divide-y divide-slate-100">
              {items.map((p) => (
                <li key={p.id} className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 truncate">{p.fullName}</p>
                      <p className="text-xs text-slate-500">CIN : {p.cin}</p>
                      <p className="mt-1 flex items-center gap-1 text-sm text-slate-600">
                        <Phone size={14} /> {p.phone}
                      </p>
                    </div>
                    {actions(p)}
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-slate-500">Page {pagination.page} sur {pagination.totalPages}</p>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="grid place-items-center w-10 h-10 rounded-full bg-white shadow-sm disabled:opacity-40">
              <ChevronLeft size={18} />
            </button>
            <button disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)} className="grid place-items-center w-10 h-10 rounded-full bg-white shadow-sm disabled:opacity-40">
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
            toast.success(modal.patient ? "Patient modifié" : "Patient créé");
            setModal({ open: false, patient: null });
            load();
          }}
        />
      )}

      {toDelete && (
        <ConfirmModal
          title="Supprimer ce patient ?"
          message={`${toDelete.fullName} sera retiré de la liste. Son historique est conservé.`}
          confirmLabel="Supprimer"
          loading={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  );
}