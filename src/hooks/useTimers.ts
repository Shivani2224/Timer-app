import { useState, useEffect, useCallback, useRef } from "react";
import type { TimerData } from "../TimerCard";

const DEFAULT_TIME = 120;
const STORAGE_KEY = "timer-app:timers";

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

function loadTimers(): TimerData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [createTimer()];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return [createTimer()];
    const timers = parsed.map((t): TimerData => {
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
      };
    });
    const maxId = timers.reduce(
      (max, t) => Math.max(max, Number(t.id) || 0),
      0
    );
    nextId = maxId + 1;
    return timers;
  } catch {
    return [createTimer()];
  }
}

export function useTimers() {
  const [timers, setTimers] = useState<TimerData[]>(loadTimers);
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

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(timers));
    } catch {}
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
