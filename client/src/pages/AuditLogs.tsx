import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ScrollText } from "lucide-react";
import { api } from "../api/axios";
import EmptyState from "../components/EmptyState";
import { ListSkeleton } from "../components/Skeleton";
import type { AuditLog, Pagination } from "../types";

const actionStyle: Record<string, string> = {
  CREATE: "bg-emerald-100 text-emerald-700",
  UPDATE: "bg-blue-100 text-blue-700",
  DELETE: "bg-red-100 text-red-700",
  STATUS_CHANGE: "bg-amber-100 text-amber-700",
  RESTORE: "bg-teal-100 text-teal-700",
};

const actionLabel: Record<string, string> = {
  CREATE: "Création",
  UPDATE: "Modification",
  DELETE: "Suppression",
  STATUS_CHANGE: "Changement de statut",
  RESTORE: "Restauration",
  
};

const entityLabel: Record<string, string> = { patient: "Patient", appointment: "Rendez-vous" };

export default function AuditLogs() {
  const [items, setItems] = useState<AuditLog[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get("/audit-logs", { params: { page, limit: 15 } })
      .then((res) => {
        setItems(res.data.items);
        setPagination(res.data.pagination);
      })
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-blue-600">Journal d'audit</h1>
      <p className="text-slate-500 mt-1 mb-6">Historique des actions effectuées dans l'application</p>

      <div className="rounded-2xl bg-white shadow-sm">
        {loading ? (
          <ListSkeleton rows={8} />
        ) : items.length === 0 ? (
          <EmptyState icon={ScrollText} title="Aucune activité enregistrée" />
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((log) => (
              <li key={log.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${actionStyle[log.action] ?? "bg-slate-100 text-slate-700"}`}>
                    {actionLabel[log.action] ?? log.action}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {entityLabel[log.entity] ?? log.entity}
                      {log.metadata && "fullName" in log.metadata ? ` : ${String(log.metadata.fullName)}` : ""}
                      {log.metadata && "patient" in log.metadata ? ` : ${String(log.metadata.patient)}` : ""}
                    </p>
                    <p className="text-xs text-slate-500">par {log.user?.fullName ?? "utilisateur supprimé"}</p>
                  </div>
                </div>
                <span className="text-xs text-slate-500 whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
                </span>
              </li>
            ))}
          </ul>
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
    </div>
  );
}