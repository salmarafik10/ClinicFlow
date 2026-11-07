import type { LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  variant?: "primary" | "ghost";
}

export default function ActionButton({ icon: Icon, label, onClick, variant = "primary" }: Props) {
  const style =
    variant === "primary"
      ? "bg-gradient-to-b from-blue-500 to-blue-700 text-white shadow-md shadow-blue-600/30"
      : "bg-white text-slate-600 shadow-sm hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700";

  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition
        h-11 w-11 sm:h-auto sm:w-auto sm:px-5 sm:py-2.5 ${style}`}
    >
      <Icon size={18} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}