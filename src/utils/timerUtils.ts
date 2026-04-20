import type { TimerStatus } from "../TimerCard";

export function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(
    s
  ).padStart(2, "0")}`;
}

export function secondsToHMS(totalSeconds: number): {
  hours: number;
  minutes: number;
  seconds: number;
} {
  return {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

export function hmsToSeconds(
  hours: number,
  minutes: number,
  seconds: number
): number {
  return hours * 3600 + minutes * 60 + seconds;
}

export function filterNumericInput(value: string): string {
  return value.replace(/[^0-9]/g, "");
}

export function getRingColor(status: TimerStatus, timeLeft: number): string {
  if (status === "idle") return "#7c5cff";
  if (timeLeft <= 5) return "#ef4444";
  if (timeLeft <= 10) return "#eab308";
  return "#7c5cff";
}

export function calculateProgress(
  status: TimerStatus,
  timeLeft: number,
  initialTime: number
): number {
  return status === "idle" ? 1 : initialTime > 0 ? timeLeft / initialTime : 0;
}
