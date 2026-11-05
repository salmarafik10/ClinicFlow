import { NavLink, Outlet } from "react-router-dom";
import { Stethoscope, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/patients", label: "Patients", end: false },
  { to: "/appointments", label: "Rendez-vous", end: false },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const initials = user?.fullName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="min-h-screen p-3 sm:p-6">
      <div className="mx-auto max-w-7xl rounded-[28px] bg-slate-50 p-3 sm:p-5 shadow-sm">
        {/* Navbar */}
        <header className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <span className="grid place-items-center w-9 h-9 rounded-xl bg-blue-600 text-white">
              <Stethoscope size={18} />
            </span>
            <span className="hidden sm:inline">ClinicFlow</span>
          </div>

          <nav className="flex items-center gap-1 sm:gap-2 rounded-full bg-slate-100 p-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `rounded-full px-3 sm:px-5 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-gradient-to-b from-blue-500 to-blue-700 text-white shadow"
                      : "text-slate-600 hover:bg-white"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right leading-tight">
              <p className="text-sm font-semibold text-slate-800">{user?.fullName}</p>
              <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
            </div>
            <span className="grid place-items-center w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">
              {initials}
            </span>
            <button
              onClick={logout}
              title="Déconnexion"
              className="grid place-items-center w-10 h-10 rounded-full bg-slate-100 text-slate-600 hover:bg-red-100 hover:text-red-600 transition"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <main className="pt-6 px-1 sm:px-3 pb-3">
          <Outlet />
        </main>
      </div>
    </div>
  );
}