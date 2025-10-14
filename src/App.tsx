import { useEffect, useState, useRef } from "react";

// Zen Lock-In - Single-file React component (TailwindCSS expected in project)
// Usage:
// 1. Add TailwindCSS to your project (recommended) or translate classes to your CSS.
// 2. Optionally add these Google Fonts to index.html for best fidelity:
//    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&family=Space+Grotesk:wght@400;600;700&family=DM+Serif+Display&display=swap" rel="stylesheet"> 
// 3. Render <ZenLockInApp /> as root component.

export default function ZenLockInApp() {
  // Helpers
  const LS_KEY = "zen:targetDate";
  const LS_GOAL_TEXT = "zen:goalText";

  const defaultDays = 90; // default countdown length when none is set

  const getDefaultTarget = () => {
    const now = new Date();
    const target = new Date(now.getTime() + defaultDays * 24 * 60 * 60 * 1000);
    // round to 00:00 next day-ish? keep time portion for a sense of urgency
    return target;
  };

  const parseSaved = () => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return getDefaultTarget();
      const d = new Date(raw);
      if (isNaN(d.getTime())) return getDefaultTarget();
      return d;
    } catch (e) {
      return getDefaultTarget();
    }
  };

  const [targetDate, setTargetDate] = useState(() => parseSaved());
  const [now, setNow] = useState(new Date());
  const [editing, setEditing] = useState(false);
  const [tempDate, setTempDate] = useState(() => toInputLocalDatetime(parseSaved()));
  const [goalText, setGoalText] = useState(() => localStorage.getItem(LS_GOAL_TEXT) || "DSA + Open Source + Writing");
  const inputRef = useRef<HTMLInputElement>(null);

  // Quotes (small curated list)
  const quotes = [
    "Discipline is choosing what you want most over what you want now.",
    "Focus is the art of saying no to distractions.",
    "Small daily improvements are the key to staggering long-term results.",
    "Build in silence. Let your results make the noise.",
    "The habit you keep determines the life you live."
  ];

  // Compute daily quote index so it changes every day
  const quoteIndex = Math.abs(Math.floor((Date.now() / (1000 * 60 * 60 * 24)))) % quotes.length;

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, targetDate.toISOString());
    } catch (e) {}
  }, [targetDate]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_GOAL_TEXT, goalText);
    } catch (e) {}
  }, [goalText]);

  function toInputLocalDatetime(d:any) {
    // returns string suitable for input[type=datetime-local] (YYYY-MM-DDTHH:mm)
    const tzOffset = d.getTimezoneOffset() * 60000; // in ms
    const localISOTime = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
    return localISOTime;
  }

  function parseInputLocalDatetime(s:any) {
    // input is in local time; convert to Date object with local timezone
    if (!s) return null;
    // s like '2025-10-15T10:30'
    const d = new Date(s);
    return d;
  }

  function resetToDefault() {
    const d = getDefaultTarget();
    setTargetDate(d);
    setTempDate(toInputLocalDatetime(d));
  }

  function clearGoal() {
    localStorage.removeItem(LS_KEY);
    localStorage.removeItem(LS_GOAL_TEXT);
    resetToDefault();
    setGoalText("DSA + Open Source + Writing");
  }

  // Time delta
  const delta = targetDate.getTime() - now.getTime();
  const remaining = delta > 0 ? delta : 0;

  const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

  function padded(n:any, digits = 2) {
    return String(n).padStart(digits, "0");
  }

  // Handlers
  function openEditor() {
    setTempDate(toInputLocalDatetime(targetDate));
    setEditing(true);
    setTimeout(() => inputRef.current && inputRef.current.focus(), 50);
  }

  function saveEdit(e:any) {
    e.preventDefault();
    const parsed = parseInputLocalDatetime(tempDate);
    if (parsed && !isNaN(parsed.getTime())) {
      setTargetDate(parsed);
      setEditing(false);
    }
  }

  function cancelEdit() {
    setEditing(false);
    setTempDate(toInputLocalDatetime(targetDate));
  }

  // Search handler
  function onSearchSubmit(e:any) {
    e.preventDefault();
    const q = (new FormData(e.target)).get("q") || "";
    const encoded = encodeURIComponent(String(q).trim());
    if (!encoded) return;
    window.location.href = `https://www.google.com/search?q=${encoded}`;
  }

  // Small UI components inside the file
  function Header() {
    return (
      <div className="w-full flex items-center justify-between text-sm opacity-80">
        <div className="flex items-center gap-3">
          <span className="px-2 py-1 rounded-md text-xs font-medium uppercase tracking-wider bg-opacity-5">Lock-in: Level Up Mode</span>
          <span className="hidden sm:inline">· {now.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={openEditor} className="text-xs px-3 py-1 rounded-md hover:bg-opacity-5 transition">📅 Edit Goal</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-neutral-900 text-neutral-100" style={{ fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial' }}>
      <div className="max-w-3xl w-full px-6 py-12">
        <div className="mx-auto w-full rounded-2xl p-8" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))', boxShadow: '0 6px 30px rgba(2,6,23,0.6)' }}>

          <Header />

          <main className="mt-8 text-center">
            <div className="space-y-6">
              <div className="leading-tight">
                <div className="text-6xl sm:text-7xl md:text-8xl font-extrabold tracking-tight" style={{ fontFamily: '"Space Grotesk", Inter, system-ui' }}>
                  {days} <span className="text-2xl align-top font-medium" style={{ opacity: 0.8 }}>days</span>
                </div>

                <div className="mt-2 text-3xl sm:text-4xl md:text-5xl font-semibold tracking-wide" style={{ fontFamily: '"Space Grotesk", Inter' }}>
                  {padded(hours)}:{padded(minutes)}:{padded(seconds)}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-center gap-4">
                <div className="px-4 py-2 rounded-full border border-neutral-700 text-sm" title="Editable goal text">
                  <span className="mr-3 font-medium">Focus:</span>
                  <span contentEditable={false} className="truncate max-w-xs inline-block align-middle">{goalText}</span>
                  <button onClick={() => { const t = prompt('Edit focus text', goalText); if (t !== null) setGoalText(t); }} className="ml-3 text-xs opacity-80 hover:opacity-100">✎</button>
                </div>
              </div>

              <div className="mt-4 max-w-xl mx-auto opacity-90 font-serif italic text-neutral-300">
                "{quotes[quoteIndex]}"
              </div>

              <div className="mt-8">
                <form onSubmit={onSearchSubmit} className="mx-auto max-w-xl">
                  <label htmlFor="q" className="sr-only">Search Google</label>
                  <div className="flex items-center gap-3 bg-neutral-800 rounded-full px-4 py-3 border border-neutral-700">
                    <span className="opacity-70 text-xl">⌕</span>
                    <input name="q" id="q" className="flex-1 bg-transparent outline-none placeholder:text-neutral-400 text-sm" placeholder="Search Google or type a query and press Enter" />
                    <button type="submit" className="text-sm px-3 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 transition">Search</button>
                  </div>
                </form>
              </div>

            </div>
          </main>

          <footer className="mt-10 text-center text-xs opacity-70">
            <div className="flex items-center justify-center gap-4">
              <a href="#" onClick={(e) => { e.preventDefault(); const u = prompt('Your blog or writing URL (optional)'); if (u) window.open(u, '_blank'); }} className="hover:underline">Link to writing</a>
              <span>•</span>
              <button onClick={clearGoal} className="hover:underline">Reset</button>
            </div>
            <div className="mt-3">© {new Date().getFullYear()} Yash Kathoke</div>
          </footer>

        </div>
      </div>

      {/* Modal editor (simple inline modal) */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6">
          <form onSubmit={saveEdit} className="bg-neutral-50 dark:bg-neutral-900 rounded-2xl p-6 w-full max-w-md shadow-lg" style={{ color: '#0f172a' }}>
            <h3 className="text-lg font-semibold mb-2">Edit Goal</h3>
            <p className="text-sm mb-4 text-neutral-600">Choose a target date & time for your lock-in.</p>

            <label className="block text-xs font-medium mb-2">Target date & time</label>
            <input ref={inputRef} type="datetime-local" value={tempDate} onChange={(e) => setTempDate(e.target.value)} className="w-full p-3 rounded-md border border-neutral-200 mb-4" />

            <label className="block text-xs font-medium mb-2">Goal (optional)</label>
            <input type="text" value={goalText} onChange={(e) => setGoalText(e.target.value)} className="w-full p-3 rounded-md border border-neutral-200 mb-4" />

            <div className="flex items-center justify-end gap-3">
              <button type="button" onClick={cancelEdit} className="px-4 py-2 rounded-md">Cancel</button>
              <button type="submit" className="px-4 py-2 rounded-md bg-indigo-600 text-white">Save</button>
            </div>

            <div className="mt-4 text-xs text-neutral-500">
              Tip: times are local to your browser. Your goal is saved to localStorage.
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
