import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export interface Option {
  value: string;
  label: string;
}

interface Props {
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  className?: string;
  size?: "md" | "sm";
  align?: "left" | "right";
}

export default function Select({ value, options, onChange, className = "", size = "md", align = "left" }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const trigger =
    size === "sm"
      ? "px-3 py-1.5 text-xs rounded-lg"
      : "px-4 py-2.5 text-sm rounded-full";

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex w-full items-center justify-between gap-2 border border-slate-200 bg-white text-slate-700 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 ${trigger}`}
      >
        <span className="truncate">{current?.label}</span>
        <ChevronDown size={size === "sm" ? 14 : 16} className={`shrink-0 text-slate-400 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <ul
          className={`absolute z-40 mt-2 min-w-full w-max overflow-hidden rounded-2xl border border-slate-100 bg-white p-1.5 shadow-xl dark:border-slate-700 dark:bg-slate-800 ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {options.map((o) => {
            const active = o.value === value;
            return (
              <li key={o.value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-6 rounded-xl px-3 py-2 text-sm transition ${
                    active
                      ? "bg-blue-50 font-semibold text-blue-700 dark:bg-slate-700 dark:text-blue-300"
                      : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700"
                  }`}
                >
                  {o.label}
                  {active && <Check size={15} />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}