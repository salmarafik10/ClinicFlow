import { useEffect, useState, type FormEvent } from "react";
import { Plus, X, UserCog } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import EmptyState from "../components/EmptyState";
import { ListSkeleton } from "../components/Skeleton";
import type { AppUser } from "../types";

const inputClass =
  "w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

export default function Users() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", password: "", role: "staff" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get("/users");
      setUsers(data);
    } catch {
      toast.error("Impossible de charger les utilisateurs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.post("/users", form);
      toast.success("Utilisateur créé");
      setOpen(false);
      setForm({ fullName: "", email: "", password: "", role: "staff" });
      load();
    } catch (err: any) {
      const data = err.response?.data;
      setError(data?.details?.[0]?.message ?? data?.message ?? "Erreur");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(u: AppUser) {
    try {
      await api.patch(`/users/${u.id}`, { isActive: !u.isActive });
      toast.success(u.isActive ? "Compte désactivé" : "Compte activé");
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Action impossible");
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-600">Utilisateurs</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{users.length} compte(s)</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-full bg-gradient-to-b from-blue-500 to-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/30"
        >
          <Plus size={18} /> Nouvel utilisateur
        </button>
      </div>

      <div className="rounded-2xl bg-white dark:bg-slate-800 shadow-sm">
        {loading ? (
          <ListSkeleton />
        ) : users.length === 0 ? (
          <EmptyState icon={UserCog} title="Aucun utilisateur" />
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-700">
            {users.map((u) => (
              <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">
                    {u.fullName} {u.id === me?.id && <span className="text-xs text-slate-400">(vous)</span>}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{u.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${u.role === "admin" ? "bg-violet-100 text-violet-700" : "bg-blue-100 text-blue-700"}`}>
                    {u.role}
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${u.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"}`}>
                    {u.isActive ? "Actif" : "Désactivé"}
                  </span>
                  {u.id !== me?.id && (
                    <button
                      onClick={() => toggleActive(u)}
                      className="rounded-lg border border-slate-200 dark:border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                      {u.isActive ? "Désactiver" : "Activer"}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 p-0 sm:p-4">
          <form onSubmit={handleCreate} className="w-full sm:max-w-md max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-xl text-slate-800 dark:text-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Nouvel utilisateur</h2>
              <button type="button" onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
              </button>
            </div>
            {error && <div className="mb-3 rounded-xl bg-red-50 text-red-700 text-sm px-3 py-2">{error}</div>}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Nom complet</label>
                <input className={inputClass} required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input type="email" className={inputClass} required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mot de passe</label>
                <input type="password" className={inputClass} required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                <p className="text-xs text-slate-400 mt-1">8 caractères, une majuscule, un chiffre</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Rôle</label>
                <select className={inputClass} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button type="button" onClick={() => setOpen(false)} className="rounded-xl bg-slate-100 dark:bg-slate-700 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600">
                Annuler
              </button>
              <button type="submit" disabled={saving} className="rounded-xl bg-gradient-to-b from-blue-500 to-blue-700 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
                {saving ? "Création..." : "Créer"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}