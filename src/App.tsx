import { useEffect, useState, useRef } from "react";
import FloatingCalendar from "./components/FloatingCal";

// Constants
const LS_KEY = "zen:targetDate";
const LS_GOAL_TEXT = "zen:goalText";
const LS_START_DATE = "zen:startDate";
const defaultDays = 90; // default countdown length when none is set

// Utility Functions
const getDefaultTarget = () => {
  const now = new Date();
  return new Date(now.getTime() + defaultDays * 24 * 60 * 60 * 1000);
};

const parseSaved = () => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return getDefaultTarget();
    const d = new Date(raw);
    return isNaN(d.getTime()) ? getDefaultTarget() : d;
  } catch {
    return getDefaultTarget();
  }
};

const toInputLocalDatetime = (d: Date) => {
  const tzOffset = d.getTimezoneOffset() * 60000; // in ms
  return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
};

const parseInputLocalDatetime = (s: string) => {
  if (!s) return null;
  return new Date(s);
};

const padded = (n: number, digits = 2) => String(n).padStart(digits, "0");

// Components
function Header({ now, openEditor }: { now: Date; openEditor: () => void }) {
  return (
    <div className="w-full flex items-center justify-between text-sm opacity-80">
      <div className="flex items-center gap-3">
        <span className="px-2 py-1 rounded-md text-xs font-medium uppercase tracking-wider bg-opacity-5">
          Lock-in: Level Up Mode
        </span>
        <span className="hidden sm:inline">
          ·{" "}
          {now.toLocaleDateString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={openEditor}
          className="text-xs px-3 py-1 rounded-md hover:bg-opacity-5 transition"
        >
          📅 Edit Goal
        </button>
      </div>
    </div>
  );
}

function Countdown({
  days,
  hours,
  minutes,
  seconds,
}: {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}) {
  return (
    <div className="leading-tight">
      <div
        className="text-6xl sm:text-7xl md:text-8xl font-extrabold tracking-tight"
        style={{ fontFamily: '"Space Grotesk", Inter, system-ui' }}
      >
        {days}{" "}
        <span
          className="text-2xl align-top font-medium"
          style={{ opacity: 0.8 }}
        >
          days
        </span>
      </div>
      <div
        className="mt-2 text-3xl sm:text-4xl md:text-5xl font-semibold tracking-wide"
        style={{ fontFamily: '"Space Grotesk", Inter' }}
      >
        {padded(hours)}:{padded(minutes)}:{padded(seconds)}
      </div>
    </div>
  );
}

function GoalEditor({
  goalText,
  setGoalText,
}: {
  goalText: string;
  setGoalText: (text: string) => void;
}) {
  return (
    <div
      className="px-4 py-2 rounded-full border border-neutral-700 text-sm"
      title="Editable goal text"
    >
      <span className="mr-3 font-medium">Focus:</span>
      <span
        contentEditable={false}
        className="truncate max-w-xs inline-block align-middle"
      >
        {goalText}
      </span>
      <button
        onClick={() => {
          const t = prompt("Edit focus text", goalText);
          if (t !== null) setGoalText(t);
        }}
        className="ml-3 text-xs opacity-80 hover:opacity-100"
      >
        ✎
      </button>
    </div>
  );
}

function Quote({ quote }: { quote: string }) {
  return (
    <div className="mt-4 max-w-xl mx-auto opacity-90 font-serif italic text-neutral-300">
      "{quote}"
    </div>
  );
}

function SearchBar({ onSearchSubmit }: { onSearchSubmit: (e: any) => void }) {
  return (
    <form onSubmit={onSearchSubmit} className="mx-auto max-w-xl">
      <label htmlFor="q" className="sr-only">
        Search Google
      </label>
      <div className="flex items-center gap-3 bg-neutral-800 rounded-full px-4 py-3 border border-neutral-700">
        <span className="opacity-70 text-xl">⌕</span>
        <input
          name="q"
          id="q"
          className="flex-1 bg-transparent outline-none placeholder:text-neutral-400 text-sm"
          placeholder="Search Google or type a query and press Enter"
        />
        <button
          type="submit"
          className="text-sm px-3 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 transition"
        >
          Search
        </button>
      </div>
    </form>
  );
}

function Footer() {
  return (
    <footer className="mt-10 text-center text-xs opacity-70">
      <div className="flex items-center justify-center gap-4">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.open("https://leetcode.com/problemset/", "_blank");
          }}
          className="hover:underline"
        >
          Leetcode
        </a>
        <span>•</span>
        <button onClick={()=> {
          window.open("https://medium.com/", "_blank")
        }} className="hover:underline">
          Medium
        </button>
        <span>•</span>
        <button onClick={()=> {
          window.open("https://www.notion.so/", "_blank")
        }} className="hover:underline">
          Notion
        </button>
        <span>•</span>
        <button onClick={()=> {
          window.open("https://github.com/", "_blank")
        }} className="hover:underline">
          Github
        </button>
      </div>
      <div className="mt-3">© {new Date().getFullYear()} Yash Kathoke</div>
    </footer>
  );
}

// Main App
export default function ZenLockInApp() {
  const [targetDate, setTargetDate] = useState(() => parseSaved());
  const [startDate] = useState(() => {
    const savedStartDate = localStorage.getItem(LS_START_DATE);
    return savedStartDate ? new Date(savedStartDate) : new Date();
  });
  const [now, setNow] = useState(new Date());
  const [editing, setEditing] = useState(false);
  const [tempDate, setTempDate] = useState(() =>
    toInputLocalDatetime(parseSaved())
  );
  const [goalText, setGoalText] = useState(
    () => localStorage.getItem(LS_GOAL_TEXT) || "DSA + Open Source + Writing"
  );
  const inputRef = useRef<HTMLInputElement>(null);

const quotes = [
  "Consistency beats intensity every time.",
  "Progress thrives on patience and repetition.",
  "Your future depends on what you repeat today.",
  "Do it especially when you don’t feel like it.",
  "Discomfort is the price of growth.",
  "Direction is more important than speed.",
  "Your habits shape your destiny quietly.",
  "Discipline turns potential into performance.",
  "Success is built one boring day at a time.",
  "Momentum is born from showing up daily.",
  "Excellence hides behind routine.",
  "The easiest excuses create the hardest regrets.",
  "Hard work compounds faster than luck.",
  "Be obsessed with consistency, not motivation.",
  "Every effort deposits into your future self.",
  "What you do after failing defines you most.",
  "Your goals need a schedule, not motivation.",
  "Improvement begins where comfort ends.",
  "The real flex is mastering your routine.",
  "No shortcuts, just repetitions that matter.",
  "Ordinary efforts repeated become extraordinary results.",
  "Train your focus like a muscle.",
  "The grind is the bridge between ideas and impact.",
  "Self-control is a superpower few practice.",
  "You become strong by keeping promises to yourself.",
  "Discipline compounds like interest.",
  "One good decision repeated daily changes everything.",
  "Show up even when it feels pointless.",
  "The standard you keep when no one’s watching defines you.",
  "Effort beats talent when talent skips days.",
];

  const quoteIndex =
    Math.abs(Math.floor(Date.now() / (1000 * 60 * 60 * 24))) % quotes.length;

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, targetDate.toISOString());
    } catch {}
  }, [targetDate]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_GOAL_TEXT, goalText);
    } catch {}
  }, [goalText]);

  const delta = targetDate.getTime() - now.getTime();
  const remaining = delta > 0 ? delta : 0;

  const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

  const openEditor = () => {
    setTempDate(toInputLocalDatetime(targetDate));
    setEditing(true);
    setTimeout(() => inputRef.current && inputRef.current.focus(), 50);
  };

  const saveEdit = (e: any) => {
    e.preventDefault();
    const parsed = parseInputLocalDatetime(tempDate);
    if (parsed && !isNaN(parsed.getTime())) {
      setTargetDate(parsed);
      setEditing(false);
    }
  };

  const cancelEdit = () => {
    setEditing(false);
    setTempDate(toInputLocalDatetime(targetDate));
  };



  const onSearchSubmit = (e: any) => {
    e.preventDefault();
    const q = new FormData(e.target).get("q") || "";
    const encoded = encodeURIComponent(String(q).trim());
    if (!encoded) return;
    window.location.href = `https://www.google.com/search?q=${encoded}`;
  };



  return (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-neutral-900 text-neutral-100"
      style={{
      fontFamily:
        'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
      }}
    >
      <div>
        <FloatingCalendar now={now} targetDate={targetDate} startDate={startDate} />

      </div>

      <div className="max-w-3xl w-full px-6 py-12">
      <div
        className="mx-auto w-full rounded-2xl p-8"
        style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
        boxShadow: "0 6px 30px rgba(2,6,23,0.6)",
        }}
      >
        <Header now={now} openEditor={openEditor} />

        <main className="mt-8 text-center">
        <div className="space-y-6">
          <Countdown
          days={days}
          hours={hours}
          minutes={minutes}
          seconds={seconds}
          />
          <div className="inline-block">
          <GoalEditor goalText={goalText} setGoalText={setGoalText} />
          </div>
          <Quote quote={quotes[quoteIndex]} />
          <SearchBar onSearchSubmit={onSearchSubmit} />
        </div>
        </main>

        <Footer />
      </div>
      </div>

      {editing && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
        <form
        onSubmit={saveEdit}
        className="bg-neutral-50 dark:bg-neutral-900 rounded-2xl p-6 w-full max-w-md shadow-lg"
        style={{ color: "#0f172a" }}
        >
        <h3 className="text-lg font-semibold mb-2">Edit Goal</h3>
        <p className="text-sm mb-4 text-white">
          Choose a target date & time for your lock-in.
        </p>

        <label
          htmlFor="target-date"
          className="block text-xs text-white font-medium mb-2"
        >
          Target date & time
        </label>
        <input
          id="target-date"
          ref={inputRef}
          type="datetime-local"
          value={tempDate}
          onChange={(e) => setTempDate(e.target.value)}
          className="w-full p-3 rounded-md border border-neutral-300 mb-4"
        />

        <label
          htmlFor="start-date"
          className="block text-xs text-white font-medium mb-2"
        >
          Start date & time
        </label>
        <input
          id="start-date"
          type="datetime-local"
          value={localStorage.getItem(LS_START_DATE) || ""}
          onChange={(e) => {
          const newStartDate = e.target.value;
          localStorage.setItem(LS_START_DATE, newStartDate);
          }}
          className="w-full p-3 rounded-md border border-neutral-300 mb-4"
        />

        <label htmlFor="goal-text" className="block text-xs text-white font-medium mb-2">
          Goal (optional)
        </label>
        <input
          id="goal-text"
          type="text"
          value={goalText}
          onChange={(e) => setGoalText(e.target.value)}
          className="w-full p-3 rounded-md border border-neutral-300 mb-4"
        />

        <div className="flex items-center justify-end gap-3">
          <button
          type="button"
          onClick={cancelEdit}
          className="px-4 py-2 rounded-md bg-neutral-200 hover:bg-neutral-300 transition"
          >
          Cancel
          </button>
          <button
          type="submit"
          className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-500 transition"
          >
          Save
          </button>
        </div>

        <div className="mt-4 text-xs text-neutral-500">
          Tip: times are local to your browser. Your goal is saved to
          localStorage.
        </div>
        </form>
      </div>
      )}
    </div>
  );
}
