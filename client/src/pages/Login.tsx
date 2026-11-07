import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Stethoscope, CalendarCheck, Users, HeartPulse } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Erreur de connexion");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white dark:bg-slate-900">
      {/* Panneau gauche */}
      <div className="hidden lg:flex relative flex-col justify-between p-10 bg-gradient-to-br from-blue-50 via-sky-100 to-blue-200 dark:from-slate-900 dark:via-blue-950 dark:to-slate-900 overflow-hidden">
        <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100 text-lg">
          <span className="grid place-items-center w-9 h-9 rounded-xl bg-blue-600 text-white">
            <Stethoscope size={20} />
          </span>
          ClinicFlow
        </div>

        <div className="relative mx-auto w-full max-w-md">
          <div className="absolute -top-10 -right-6 w-72 h-72 rounded-full bg-white/50 dark:bg-blue-600/10 blur-2xl" />
          <div className="relative space-y-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-5 flex items-center gap-4">
              <span className="grid place-items-center w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400"><Users /></span>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Patients suivis</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">Tout en un lieu</p>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-5 flex items-center gap-4 ml-10">
              <span className="grid place-items-center w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400"><CalendarCheck /></span>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Rendez-vous</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">Sans chevauchement</p>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-5 flex items-center gap-4">
              <span className="grid place-items-center w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-900/50 text-rose-500 dark:text-rose-400"><HeartPulse /></span>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Votre clinique</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">Simple et fluide</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400">© ClinicFlow</p>
      </div>

      {/* Formulaire */}
      <div className="flex items-center justify-center p-6">
        <form onSubmit={handleSubmit} className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Bienvenue sur ClinicFlow 👋</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-8">
            Connectez-vous pour gérer vos patients et rendez-vous.
          </p>

          {error && (
            <div className="mb-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm px-4 py-3">
              {error}
            </div>
          )}

          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
          <div className="relative mb-4">
            <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@clinicflow.com"
              className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Mot de passe</label>
          <div className="relative mb-6">
            <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type={showPwd ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 pl-11 pr-11 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => setShowPwd(!showPwd)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-gradient-to-b from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-semibold py-3 shadow-md shadow-blue-600/30 transition disabled:opacity-60"
          >
            {submitting ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}