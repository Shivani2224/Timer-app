import { useState, useEffect, useCallback, useRef } from "react";
import EditTimer from "./EditTimer";
import TimerCard, { type TimerData } from "./TimerCard";

const DEFAULT_TIME = 120;

let nextId = 1;
function createTimer(): TimerData {
  const id = nextId++;
  return {
    id: String(id),
    label: `Timer ${id}`,
    timeLeft: DEFAULT_TIME,
    initialTime: DEFAULT_TIME,
    status: "idle",
    sessions: 0,
  };
}

export default function App() {
  const [timers, setTimers] = useState<TimerData[]>([createTimer()]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimers((prev) => {
        let hasChanges = false;
        const next = prev.map((t) => {
          if (t.status !== "running") return t;
          hasChanges = true;
          if (t.timeLeft <= 1) {
            const audio = new Audio("/alarm.mp3");
            audio.play().catch(() => {});
            return {
              ...t,
              status: "idle" as const,
              timeLeft: t.initialTime,
              sessions: t.sessions + 1,
            };
          }
          return { ...t, timeLeft: t.timeLeft - 1 };
        });
        return hasChanges ? next : prev;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    const running = timers.find(
      (t) => t.status === "running" || t.status === "paused"
    );
    if (running) {
      const h = Math.floor(running.timeLeft / 3600);
      const m = Math.floor((running.timeLeft % 3600) / 60);
      const s = running.timeLeft % 60;
      const display = `${String(h).padStart(2, "0")}:${String(m).padStart(
        2,
        "0"
      )}:${String(s).padStart(2, "0")}`;
      document.title = `${display} — Timer`;
    } else {
      document.title = "Timer";
    }
  }, [timers]);

  const updateTimer = useCallback((id: string, updates: Partial<TimerData>) => {
    setTimers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  }, []);

  const handleStart = useCallback(
    (id: string) => updateTimer(id, { status: "running" }),
    [updateTimer]
  );
  const handlePause = useCallback(
    (id: string) => updateTimer(id, { status: "paused" }),
    [updateTimer]
  );
  const handleResume = useCallback(
    (id: string) => updateTimer(id, { status: "running" }),
    [updateTimer]
  );
  const handleStop = useCallback((id: string) => {
    setTimers((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: "idle", timeLeft: t.initialTime } : t
      )
    );
  }, []);
  const handleReset = useCallback((id: string) => {
    setTimers((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: "idle", timeLeft: t.initialTime } : t
      )
    );
  }, []);
  const handleInlineEdit = useCallback(
    (id: string, totalSeconds: number) => {
      updateTimer(id, { timeLeft: totalSeconds, initialTime: totalSeconds });
    },
    [updateTimer]
  );
  const handleDelete = useCallback((id: string) => {
    setTimers((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleLabelChange = useCallback(
    (id: string, label: string) => {
      updateTimer(id, { label });
    },
    [updateTimer]
  );

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.code !== "Space") return;
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      e.preventDefault();

      setTimers((prev) => {
        const running = prev.find((t) => t.status === "running");
        if (running) {
          return prev.map((t) =>
            t.id === running.id ? { ...t, status: "paused" as const } : t
          );
        }

        const paused = prev.find((t) => t.status === "paused");
        if (paused) {
          return prev.map((t) =>
            t.id === paused.id ? { ...t, status: "running" as const } : t
          );
        }

        const idle = prev.find((t) => t.status === "idle" && t.timeLeft > 0);
        if (idle) {
          return prev.map((t) =>
            t.id === idle.id ? { ...t, status: "running" as const } : t
          );
        }

        return prev;
      });
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleAddTimer = useCallback(() => {
    setTimers((prev) => [...prev, createTimer()]);
  }, []);

  return (
    <div className="min-h-screen px-3 sm:px-6 lg:px-8 py-8 font-poppins">
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 tracking-tight">
          Timer
        </h1>
        <p className="text-muted text-xs sm:text-sm mt-1 hidden sm:block">
          Stay productive, stay focused
        </p>
      </div>

      {timers.length === 1 ? (
        <div className="flex flex-col items-center">
          <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg">
            <TimerCard
              timer={timers[0]}
              onStart={handleStart}
              onPause={handlePause}
              onResume={handleResume}
              onStop={handleStop}
              onReset={handleReset}
              onEdit={(id) => setEditingId(id)}
              onInlineEdit={handleInlineEdit}
              onDelete={handleDelete}
              canDelete={false}
              solo
              onLabelChange={handleLabelChange}
            />
          </div>
          <button
            onClick={handleAddTimer}
            aria-label="Add new timer"
            className="mt-4 sm:mt-6 px-5 sm:px-8 py-2.5 sm:py-3 bg-gray-100 hover:bg-gray-200 text-muted hover:text-gray-800 text-sm sm:text-base font-semibold rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 border border-gray-200 cursor-pointer flex items-center gap-2"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            Add Timer
          </button>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {timers.map((timer) => (
            <TimerCard
              key={timer.id}
              timer={timer}
              onStart={handleStart}
              onPause={handlePause}
              onResume={handleResume}
              onStop={handleStop}
              onReset={handleReset}
              onEdit={(id) => setEditingId(id)}
              onInlineEdit={handleInlineEdit}
              onDelete={handleDelete}
              canDelete
              onLabelChange={handleLabelChange}
            />
          ))}

          <button
              onClick={handleAddTimer}
              aria-label="Add Timer button"
            className="rounded-2xl sm:rounded-3xl border-2 border-dashed border-gray-300 hover:border-primary bg-white/30 hover:bg-white/50 backdrop-blur-xl p-5 sm:p-6 flex flex-col items-center justify-center gap-2 min-h-50 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer group"
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-400 group-hover:text-primary transition-colors"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            <span className="text-sm font-medium text-gray-400 group-hover:text-primary transition-colors">
              Add Timer
            </span>
          </button>
        </div>
      )}

      <p className="text-center text-muted/50 text-xs mt-6 hidden sm:block">
        Press Space to start / pause
      </p>

      {editingId && (
        <EditTimer
          initialTime={timers.find((t) => t.id === editingId)?.initialTime ?? 0}
          onSave={(totalSeconds) => {
            updateTimer(editingId, {
              timeLeft: totalSeconds,
              initialTime: totalSeconds,
            });
            setEditingId(null);
          }}
          onClose={() => setEditingId(null)}
        />
      )}
    </div>
  );
}
