import { useState, useRef, useEffect, useMemo } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";

interface Props {
  value: string; // "YYYY-MM-DD" or ""
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  size?: "md" | "sm";
  align?: "left" | "right";
}

const monthNames = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

const weekDays = ["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"];

function toYMD(year: number, month: number, day: number) {
  const m = String(month + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

function formatDisplay(ymd: string) {
  if (!ymd) return "";
  const [y, m, d] = ymd.split("-").map(Number);
  if (!y || !m || !d) return ymd;
  return `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
}

export default function DatePicker({
  value,
  onChange,
  placeholder = "jj/mm/aaaa",
  className = "",
  size = "md",
  align = "left",
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const initialDate = useMemo(() => {
    if (value) {
      const [y, m, d] = value.split("-").map(Number);
      if (y && m && d) return new Date(y, m - 1, d);
    }
    return new Date();
  }, [value]);

  const [viewDate, setViewDate] = useState<Date>(initialDate);

  useEffect(() => {
    if (open) {
      setViewDate(initialDate);
    }
  }, [open, initialDate]);

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

  const today = new Date();
  const todayYMD = toYMD(today.getFullYear(), today.getMonth(), today.getDate());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const dayOfWeek = (firstDayOfMonth.getDay() + 6) % 7; // lundi = 0
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: { day: number; ymd: string; isCurrentMonth: boolean }[] = [];

    // Jours du mois précédent
    for (let i = dayOfWeek - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevDate = new Date(year, month - 1, d);
      days.push({
        day: d,
        ymd: toYMD(prevDate.getFullYear(), prevDate.getMonth(), d),
        isCurrentMonth: false,
      });
    }

    // Jours du mois courant
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({
        day: d,
        ymd: toYMD(year, month, d),
        isCurrentMonth: true,
      });
    }

    // Jours du mois suivant pour compléter
    const remaining = (7 - (days.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const nextDate = new Date(year, month + 1, d);
      days.push({
        day: d,
        ymd: toYMD(nextDate.getFullYear(), nextDate.getMonth(), d),
        isCurrentMonth: false,
      });
    }

    return days;
  }, [year, month]);

  function prevMonth() {
    setViewDate(new Date(year, month - 1, 1));
  }

  function nextMonth() {
    setViewDate(new Date(year, month + 1, 1));
  }

  const trigger =
    size === "sm"
      ? "px-3 py-1.5 text-xs rounded-lg"
      : "px-4 py-2.5 text-sm rounded-full";

  const displayDate = formatDisplay(value);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex w-full items-center justify-between gap-2 border border-slate-200 bg-white text-slate-700 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 ${trigger}`}
      >
        <div className="flex items-center gap-2 truncate min-w-0">
          <CalendarIcon size={size === "sm" ? 14 : 16} className="shrink-0 text-slate-400 dark:text-slate-500" />
          <span className={`truncate ${!displayDate ? "text-slate-400 dark:text-slate-500" : ""}`}>
            {displayDate || placeholder}
          </span>
        </div>
        {value ? (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
            title="Effacer la date"
            className="grid place-items-center w-5 h-5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200 transition shrink-0"
          >
            <X size={13} />
          </span>
        ) : null}
      </button>

      {open && (
        <div
          className={`absolute z-50 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-100 bg-white p-3.5 shadow-xl dark:border-slate-700 dark:bg-slate-800 ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {/* En-tête mois & navigation */}
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100 capitalize">
              {monthNames[month]} {year}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={prevMonth}
                title="Mois précédent"
                className="grid place-items-center w-7 h-7 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 transition"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={nextMonth}
                title="Mois suivant"
                className="grid place-items-center w-7 h-7 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 transition"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* En-têtes jours de semaine */}
          <div className="grid grid-cols-7 mb-1 text-center text-xs font-semibold text-slate-400 dark:text-slate-500">
            {weekDays.map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Grille des jours */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {calendarDays.map((item, idx) => {
              const isSelected = item.ymd === value;
              const isToday = item.ymd === todayYMD;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    onChange(item.ymd);
                    setOpen(false);
                  }}
                  className={`grid place-items-center h-8 w-8 mx-auto rounded-xl font-medium transition ${
                    isSelected
                      ? "bg-gradient-to-b from-blue-500 to-blue-700 text-white font-semibold shadow-md shadow-blue-600/30"
                      : item.isCurrentMonth
                      ? isToday
                        ? "border border-blue-500 text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-50 dark:hover:bg-slate-700"
                        : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                      : "text-slate-300 dark:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  }`}
                >
                  {item.day}
                </button>
              );
            })}
          </div>

          {/* Actions rapides au bas */}
          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700 text-xs">
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className="text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 font-medium px-1.5 py-1 rounded transition"
            >
              Effacer
            </button>
            <button
              type="button"
              onClick={() => {
                onChange(todayYMD);
                setOpen(false);
              }}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold px-1.5 py-1 rounded transition"
            >
              Aujourd'hui
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

