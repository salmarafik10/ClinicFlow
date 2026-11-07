import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Appointment, AppointmentStatus } from "../types";

interface Props {
  appointments: Appointment[];
  weekStart: Date; // lundi à 00:00 (heure locale)
  onWeekChange: (d: Date) => void;
  onSelect: (a: Appointment) => void;
}

const HOURS = Array.from({ length: 11 }, (_, i) => i + 8); // 8h à 18h
const ROW = 64; // hauteur d'une heure en px

const color: Record<AppointmentStatus, string> = {
  pending: "bg-amber-50 border-amber-300 text-amber-800 dark:bg-amber-950/60 dark:border-amber-700 dark:text-amber-200",
  confirmed: "bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/60 dark:border-emerald-700 dark:text-emerald-200",
  cancelled: "bg-red-50 border-red-300 text-red-700 dark:bg-red-950/60 dark:border-red-700 dark:text-red-300 opacity-60",
};

export function startOfWeek(d: Date) {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7; // lundi = 0
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
}

export default function WeekCalendar({ appointments, weekStart, onWeekChange, onSelect }: Props) {
  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => new Date(weekStart.getTime() + i * 86400000)),
    [weekStart]
  );

  const shift = (n: number) => onWeekChange(new Date(weekStart.getTime() + n * 7 * 86400000));
  const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  const today = new Date();

  const label = `${days[0].toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} - ${days[6].toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}`;

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-800 shadow-sm">
      <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-700">
        <p className="font-bold text-slate-800 dark:text-slate-100">{label}</p>
        <div className="flex items-center gap-2">
          <button onClick={() => onWeekChange(startOfWeek(new Date()))} className="rounded-full bg-slate-100 dark:bg-slate-700 px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600">
            Aujourd'hui
          </button>
          <button onClick={() => shift(-1)} className="grid place-items-center w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-200">
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => shift(1)} className="grid place-items-center w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-200">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[760px]">
          <div className="grid grid-cols-[56px_repeat(7,1fr)] border-b border-slate-100 dark:border-slate-700">
            <div />
            {days.map((d) => (
              <div key={d.toISOString()} className={`py-2 text-center text-xs ${sameDay(d, today) ? "text-blue-600 dark:text-blue-400 font-bold" : "text-slate-500 dark:text-slate-400"}`}>
                {d.toLocaleDateString("fr-FR", { weekday: "short" })}
                <p className="text-base font-semibold">{d.getDate()}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-[56px_repeat(7,1fr)]">
            <div>
              {HOURS.map((h) => (
                <div key={h} style={{ height: ROW }} className="pr-2 text-right text-xs text-slate-400 dark:text-slate-500 -translate-y-2">
                  {h}:00
                </div>
              ))}
            </div>

            {days.map((d) => {
              const dayItems = appointments.filter((a) => sameDay(new Date(a.appointmentDate), d));
              return (
                <div key={d.toISOString()} className="relative border-l border-slate-100 dark:border-slate-700" style={{ height: HOURS.length * ROW }}>
                  {HOURS.map((h, i) => (
                    <div key={h} style={{ top: i * ROW, height: ROW }} className="absolute inset-x-0 border-t border-slate-100 dark:border-slate-700" />
                  ))}
                  {dayItems.map((a) => {
                    const t = new Date(a.appointmentDate);
                    const minutes = (t.getHours() - HOURS[0]) * 60 + t.getMinutes();
                    if (minutes < 0 || minutes > HOURS.length * 60 - 15) return null;
                    return (
                      <button
                        key={a.id}
                        onClick={() => onSelect(a)}
                        style={{ top: (minutes / 60) * ROW, height: ROW / 2 - 2 }}
                        className={`absolute inset-x-1 overflow-hidden rounded-lg border px-1.5 text-left text-[11px] leading-tight ${color[a.status]}`}
                      >
                        <p className="font-semibold truncate">{a.patient?.fullName}</p>
                        <p className="truncate">{t.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</p>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}