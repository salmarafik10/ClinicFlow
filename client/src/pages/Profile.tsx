import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { api } from "../api/axios";
import { useAuth } from "../context/AuthContext";

const inputClass =
  "w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

export default function Profile() {
  const { user } = useAuth();
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (form.newPassword !== form.confirm) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    setSaving(true);
    try {
      await api.put("/users/me/password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success("Mot de passe modifié");
      setForm({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (err: any) {
      const data = err.response?.data;
      setError(data?.details?.[0]?.message ?? data?.message ?? "Erreur");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl sm:text-3xl font-bold text-blue-600">Mon profil</h1>

      <div className="rounded-2xl bg-white p-5 shadow-sm mt-6">
        <p className="font-semibold text-slate-800">{user?.fullName}</p>
        <p className="text-sm text-slate-500">{user?.email}</p>
        <p className="text-xs text-slate-400 capitalize mt-1">Rôle : {user?.role}</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-5 shadow-sm mt-4">
        <h2 className="font-bold text-slate-800 mb-4">Changer le mot de passe</h2>
        {error && <div className="mb-3 rounded-xl bg-red-50 text-red-700 text-sm px-3 py-2">{error}</div>}
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Mot de passe actuel</label>
            <input type="password" className={inputClass} required value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nouveau mot de passe</label>
            <input type="password" className={inputClass} required value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Confirmer</label>
            <input type="password" className={inputClass} required value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
          </div>
        </div>
        <button type="submit" disabled={saving} className="mt-5 rounded-xl bg-gradient-to-b from-blue-500 to-blue-700 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
          {saving ? "Enregistrement..." : "Modifier"}
        </button>
      </form>
    </div>
  );
}