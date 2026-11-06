import { AlertTriangle } from "lucide-react";

interface Props {
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ title, message, confirmLabel = "Confirmer", loading, onConfirm, onCancel }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 p-0 sm:p-4">
      <div className="w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl bg-white p-6 shadow-xl">
        <span className="grid place-items-center w-12 h-12 rounded-full bg-red-100 text-red-600 mb-4">
          <AlertTriangle size={22} />
        </span>
        <h2 className="text-lg font-bold text-slate-800">{title}</h2>
        <p className="text-sm text-slate-500 mt-1">{message}</p>
        <div className="flex gap-2 mt-6">
          <button onClick={onCancel} className="flex-1 rounded-xl bg-slate-100 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200">
            Annuler
          </button>
          <button onClick={onConfirm} disabled={loading} className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60">
            {loading ? "..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
} 