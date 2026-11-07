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
  pending: "bg-amber-50 border-amber-300 text-amber-800",
  confirmed: "bg-emerald-50 border-emerald-300 text-emerald-800",
  cancelled: "bg-red-50 border-red-300 text-red-700 opacity-60",
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
    <div className="rounded-2xl bg-white shadow-sm">
      <div className="flex items-center justify-between p-4 border-b border-slate-100">
        <p className="font-bold text-slate-800">{label}</p>
        <div className="flex items-center gap-2">
          <button onClick={() => onWeekChange(startOfWeek(new Date()))} className="rounded-full bg-slate-100 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200">
            Aujourd'hui
          </button>
          <button onClick={() => shift(-1)} className="grid place-items-center w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200">
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => shift(1)} className="grid place-items-center w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[760px]">
          <div className="grid grid-cols-[56px_repeat(7,1fr)] border-b border-slate-100">
            <div />
            {days.map((d) => (
              <div key={d.toISOString()} className={`py-2 text-center text-xs ${sameDay(d, today) ? "text-blue-600 font-bold" : "text-slate-500"}`}>
                {d.toLocaleDateString("fr-FR", { weekday: "short" })}
                <p className="text-base font-semibold">{d.getDate()}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-[56px_repeat(7,1fr)]">
            <div>
              {HOURS.map((h) => (
                <div key={h} style={{ height: ROW }} className="pr-2 text-right text-xs text-slate-400 -translate-y-2">
                  {h}:00
                </div>
              ))}
            </div>

            {days.map((d) => {
              const dayItems = appointments.filter((a) => sameDay(new Date(a.appointmentDate), d));
              return (
                <div key={d.toISOString()} className="relative border-l border-slate-100" style={{ height: HOURS.length * ROW }}>
                  {HOURS.map((h, i) => (
                    <div key={h} style={{ top: i * ROW, height: ROW }} className="absolute inset-x-0 border-t border-slate-100" />
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