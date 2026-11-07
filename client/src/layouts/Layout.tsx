import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Stethoscope, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/", label: "Dashboard", end: true, admin: false },
  { to: "/patients", label: "Patients", end: false, admin: false },
  { to: "/appointments", label: "Rendez-vous", end: false, admin: false },
  { to: "/audit", label: "Audit", end: false, admin: true },
  { to: "/users", label: "Utilisateurs", end: false, admin: true },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const visibleLinks = links.filter((l) => !l.admin || user?.role === "admin");
  const initials = user?.fullName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  const desktopLink = ({ isActive }: { isActive: boolean }) =>
    `rounded-full px-5 py-2 text-sm font-medium transition ${
      isActive ? "bg-gradient-to-b from-blue-500 to-blue-700 text-white shadow" : "text-slate-600 hover:bg-white"
    }`;

  const mobileLink = ({ isActive }: { isActive: boolean }) =>
    `block rounded-xl px-4 py-3 text-sm font-medium ${
      isActive ? "bg-blue-600 text-white" : "text-slate-700 hover:bg-slate-100"
    }`;

  return (
    <div className="min-h-screen p-2 sm:p-6">
      <div className="mx-auto max-w-7xl rounded-3xl bg-slate-50 p-3 sm:p-5 shadow-sm">
        <header className="rounded-2xl bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <span className="grid place-items-center w-9 h-9 rounded-xl bg-blue-600 text-white">
                <Stethoscope size={18} />
              </span>
              ClinicFlow
            </div>

            <nav className="hidden md:flex items-center gap-2 rounded-full bg-slate-100 p-1">
              {visibleLinks.map((l) => (
                <NavLink key={l.to} to={l.to} end={l.end} className={desktopLink}>
                  {l.label}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden lg:block text-right leading-tight">
                <p className="text-sm font-semibold text-slate-800">{user?.fullName}</p>
                <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
              </div>
              <NavLink to="/profile" title="Mon profil" className="grid place-items-center w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm hover:bg-blue-200">
                {initials}
              </NavLink>
              <button
                onClick={logout}
                title="Déconnexion"
                className="hidden md:grid place-items-center w-10 h-10 rounded-full bg-slate-100 text-slate-600 hover:bg-red-100 hover:text-red-600 transition"
              >
                <LogOut size={18} />
              </button>
              <button
                onClick={() => setOpen(!open)}
                aria-label="Menu"
                className="md:hidden grid place-items-center w-10 h-10 rounded-full bg-slate-100 text-slate-700"
              >
                {open ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {open && (
            <nav className="md:hidden mt-3 pt-3 border-t border-slate-100 space-y-1">
              {visibleLinks.map((l) => (
                <NavLink key={l.to} to={l.to} end={l.end} className={mobileLink} onClick={() => setOpen(false)}>
                  {l.label}
                </NavLink>
              ))}
              <button
                onClick={logout}
                className="flex w-full items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut size={16} /> Déconnexion
              </button>
            </nav>
          )}
        </header>

        <main className="pt-6 px-1 sm:px-3 pb-3">
          <Outlet />
        </main>
      </div>
    </div>
  );
}