import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

function generateCalendarMatrix(year: number, month: number): (Date | null)[][] {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const matrix: (Date | null)[][] = [];
  let week: (Date | null)[] = [];

  for (let i = 0; i < first.getDay(); i++) week.push(null);
  for (let d = 1; d <= last.getDate(); d++) {
    week.push(new Date(year, month, d));
    if (week.length === 7) {
      matrix.push(week);
      week = [];
    }
  }
  if (week.length) {
    while (week.length < 7) week.push(null);
    matrix.push(week);
  }
  return matrix;
}

function dayState(day: Date | null, now: Date, targetDate: Date) {
  if (!day) return "empty";
  const d = new Date(day.getFullYear(), day.getMonth(), day.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (d < today) return "past";
  if (d.getTime() === today.getTime()) return "today";
  if (d > targetDate) return "beyond";
  return "future";
}

export function Calendar({ now, targetDate }: { now: Date; targetDate: Date, startDate?: Date }) {
  const [displayMonth, setDisplayMonth] = useState({ year: now.getFullYear(), month: now.getMonth() });

  useEffect(() => {
    setDisplayMonth({ year: now.getFullYear(), month: now.getMonth() });
  }, [now.getMonth(), now.getFullYear()]);

  const matrix = generateCalendarMatrix(displayMonth.year, displayMonth.month);

  const prevMonth = () => {
    setDisplayMonth((d) => {
      const m = d.month - 1;
      return m < 0 ? { year: d.year - 1, month: 11 } : { year: d.year, month: m };
    });
  };

  const nextMonth = () => {
    setDisplayMonth((d) => {
      const m = d.month + 1;
      return m > 11 ? { year: d.year + 1, month: 0 } : { year: d.year, month: m };
    });
  };

  return (
    <aside className="lg:col-span-1">
      <div className="bg-white/80 dark:bg-[#0B0B0C] rounded-2xl border border-gray-100 dark:border-gray-800 p-4 shadow-md transition-colors duration-200">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">
            {new Date(displayMonth.year, displayMonth.month).toLocaleString(undefined, {
              month: "long",
              year: "numeric",
            })}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={nextMonth}
              className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Next month"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 text-center mt-3 text-xs opacity-60 font-medium">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>

        <div className="mt-3 flex flex-col gap-1">
          {matrix.map((week, i) => (
            <div key={i} className="grid grid-cols-7 gap-1">
              {week.map((d, j) => {
                const state = dayState(d, now, targetDate);
                const base =
                  "w-8 h-8 flex items-center justify-center rounded-full text-xs transition-all duration-150 select-none";
                let classes = "";

                switch (state) {
                  case "today":
                    classes = "bg-green-500 text-white font-semibold ring-2 ring-green-400";
                    break;
                  case "past":
                    classes = "opacity-40 line-through decoration-red-400/70 text-gray-500";
                    break;
                  case "beyond":
                    classes = "text-gray-400 opacity-70";
                    break;
                  case "future":
                    classes = "hover:bg-indigo-50 dark:hover:bg-gray-900";
                    break;
                  default:
                    classes = "";
                }

                return (
                  <div key={j} className={`${base} ${classes}`}>
                    {d ? d.getDate() : ""}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div className="mt-4 text-xs opacity-70 text-center italic">
          Past days are faded. Today is highlighted.
        </div>
      </div>
    </aside>
  );
}