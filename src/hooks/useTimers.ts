import { useState, useEffect, useCallback, useRef } from "react";
import type { TimerData } from "../TimerCard";

const DEFAULT_TIME = 120;
const STORAGE_KEY = "timer-app:timers";

function createTimer(id: number): TimerData {
  return {
    id: String(id),
    label: `Timer ${id}`,
    timeLeft: DEFAULT_TIME,
    initialTime: DEFAULT_TIME,
    status: "idle",
    sessions: 0,
  };
}

function nextTimerId(timers: TimerData[]): number {
  if (timers.length === 0) return 1;
  return Math.max(...timers.map((t) => Number(t.id) || 0)) + 1;
}

function loadTimers(): TimerData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [createTimer(1)];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return [createTimer(1)];
    return parsed.map((t): TimerData => {
      const initialTime =
        typeof t.initialTime === "number" ? t.initialTime : DEFAULT_TIME;
      const wasRunning = t.status === "running";
      return {
        id: String(t.id),
        label: typeof t.label === "string" ? t.label : `Timer ${t.id}`,
        initialTime,
        timeLeft: wasRunning
          ? initialTime
          : typeof t.timeLeft === "number"
            ? t.timeLeft
            : initialTime,
        status: t.status === "paused" ? "paused" : "idle",
        sessions: typeof t.sessions === "number" ? t.sessions : 0,
        endsAt: null,
      };
    });
  } catch {
    return [createTimer(1)];
  }
}

function startRunning(t: TimerData): TimerData {
  return {
    ...t,
    status: "running",
    endsAt: Date.now() + t.timeLeft * 1000,
  };
}

function pauseRunning(t: TimerData): TimerData {
  const remaining =
    typeof t.endsAt === "number"
      ? Math.max(0, Math.ceil((t.endsAt - Date.now()) / 1000))
      : t.timeLeft;
  return { ...t, status: "paused", timeLeft: remaining, endsAt: null };
}

export function useTimers() {
  const [timers, setTimers] = useState<TimerData[]>(loadTimers);
  const [editingId, setEditingId] = useState<string | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimers((prev) => {
        let hasChanges = false;
        const now = Date.now();
        const next = prev.map((t) => {
          if (t.status !== "running" || typeof t.endsAt !== "number") return t;
          const remainingSeconds = Math.max(
            0,
            Math.ceil((t.endsAt - now) / 1000),
          );
          if (remainingSeconds === t.timeLeft) return t;
          hasChanges = true;
          if (remainingSeconds <= 0) {
            return {
              ...t,
              status: "idle" as const,
              timeLeft: t.initialTime,
              sessions: t.sessions + 1,
              endsAt: null,
            };
          }
          return { ...t, timeLeft: remainingSeconds };
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
      (t) => t.status === "running" || t.status === "paused",
    );
    if (running) {
      const h = Math.floor(running.timeLeft / 3600);
      const m = Math.floor((running.timeLeft % 3600) / 60);
      const s = running.timeLeft % 60;
      const display = `${String(h).padStart(2, "0")}:${String(m).padStart(
        2,
        "0",
      )}:${String(s).padStart(2, "0")}`;
      document.title = `${display} — Timer`;
    } else {
      document.title = "Timer";
    }
  }, [timers]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(timers));
    } catch {}
  }, [timers]);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const prevSessionsRef = useRef<Record<string, number>>({});
  useEffect(() => {
    for (const t of timers) {
      const prev = prevSessionsRef.current[t.id] ?? t.sessions;
      if (t.sessions > prev) {
        new Audio("/alarm.mp3").play().catch(() => {});
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Timer complete", { body: t.label });
        }
      }
      prevSessionsRef.current[t.id] = t.sessions;
    }
  }, [timers]);

  const updateTimer = useCallback((id: string, updates: Partial<TimerData>) => {
    setTimers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    );
  }, []);

  const handleStart = useCallback((id: string) => {
    setTimers((prev) => prev.map((t) => (t.id === id ? startRunning(t) : t)));
  }, []);
  const handlePause = useCallback((id: string) => {
    setTimers((prev) => prev.map((t) => (t.id === id ? pauseRunning(t) : t)));
  }, []);
  const handleResume = useCallback((id: string) => {
    setTimers((prev) => prev.map((t) => (t.id === id ? startRunning(t) : t)));
  }, []);
  const handleStop = useCallback((id: string) => {
    setTimers((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: "idle", timeLeft: t.initialTime, endsAt: null }
          : t,
      ),
    );
  }, []);
  const handleReset = useCallback((id: string) => {
    setTimers((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: "idle", timeLeft: t.initialTime, endsAt: null }
          : t,
      ),
    );
  }, []);
  const handleInlineEdit = useCallback(
    (id: string, totalSeconds: number) => {
      updateTimer(id, { timeLeft: totalSeconds, initialTime: totalSeconds });
    },
    [updateTimer],
  );
  const handleDelete = useCallback((id: string) => {
    setTimers((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleLabelChange = useCallback(
    (id: string, label: string) => {
      updateTimer(id, { label });
    },
    [updateTimer],
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
          return prev.map((t) => (t.id === running.id ? pauseRunning(t) : t));
        }

        const paused = prev.find((t) => t.status === "paused");
        if (paused) {
          return prev.map((t) => (t.id === paused.id ? startRunning(t) : t));
        }

        const idle = prev.find((t) => t.status === "idle" && t.timeLeft > 0);
        if (idle) {
          return prev.map((t) => (t.id === idle.id ? startRunning(t) : t));
        }

        return prev;
      });
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleAddTimer = useCallback(() => {
    setTimers((prev) => [...prev, createTimer(nextTimerId(prev))]);
  }, []);

  return {
    timers,
    editingId,
    setEditingId,
    updateTimer,
    handleStart,
    handlePause,
    handleResume,
    handleStop,
    handleReset,
    handleInlineEdit,
    handleDelete,
    handleLabelChange,
    handleAddTimer,
  };
}
