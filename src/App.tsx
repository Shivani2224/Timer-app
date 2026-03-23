import { useState, useEffect } from "react";
import EditTimer from "./EditTimer";

const DEFAULT_TIME = 120;
type TimerStatus = "idle" | "running" | "paused";

export default function App() {
  const [timeLeft, setTimeLeft] = useState(DEFAULT_TIME);
  const [initialTime, setInitialTime] = useState(DEFAULT_TIME);
  const [status, setStatus] = useState<TimerStatus>("idle");
  const [showEdit, setShowEdit] = useState(false);

  const progress = status === "idle" ? 1 : (initialTime > 0 ? timeLeft / initialTime : 0);
  const arcRadius = 140;
  const arcLength = Math.PI * arcRadius;
  const arcOffset = arcLength * (1 - progress);
  const arcColor = status === "idle" ? "#22c55e" : timeLeft <= 5 ? "#ef4444" : timeLeft <= 10 ? "#eab308" : "#22c55e";
  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;
  const display = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  useEffect(() => {
    if (status !== "running") return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [status]);

  useEffect(() => {
    document.title = status === "running" || status === "paused"
      ? `${display} — Timer`
      : "Timer";
  }, [display, status]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (showEdit) return;
      if (e.code !== "Space") return;
      e.preventDefault();
      if (status === "idle" && timeLeft > 0) setStatus("running");
      else if (status === "running") setStatus("paused");
      else if (status === "paused") setStatus("running");
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [status, showEdit]);

  useEffect(() => {
    if (timeLeft === 0 && status === "running") {
      const audio = new Audio("/alarm.mp3");
      audio.play().catch(() => {});
      setStatus("idle");
      setTimeLeft(initialTime);
    }
  }, [timeLeft, status, initialTime]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="flex flex-col items-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Timer</h1>
        <div className="flex flex-col items-center justify-center mb-8 gap-4">
          <svg width="320" height="170" viewBox="0 0 320 170">
            <path
              id="arcPath"
              d="M 10 160 A 140 140 0 0 1 310 160"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="12"
              strokeLinecap="round"
            />
            {progress > 0 && (
              <path
                d="M 10 160 A 140 140 0 0 1 310 160"
                fill="none"
                stroke={arcColor}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${arcLength}`}
                strokeDashoffset={`${arcOffset}`}
                style={{ transition: "stroke 0.3s" }}
              />
            )}
          </svg>
          <h3 className="text-5xl font-mono text-gray-800 tracking-widest -mt-24">
            {display}
          </h3>
          <div className="flex gap-2 justify-center">
            {status === "idle" && (
              <>
                <button
                  className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setStatus("running")}
                  disabled={timeLeft === 0}
                >
                  Start
                </button>
                <button
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition"
                  onClick={() => setShowEdit(true)}
                >
                  Edit timer
                </button>
              </>
            )}
            {status === "running" && (
              <button
                className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg transition"
                onClick={() => setStatus("paused")}
              >
                Pause
              </button>
            )}
            {status === "paused" && (
              <button
                className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition"
                onClick={() => setStatus("running")}
              >
                Resume
              </button>
            )}
            {status !== "idle" && (
              <>
                <button
                  className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition"
                  onClick={() => {
                    setTimeLeft(initialTime);
                    setStatus("idle");
                  }}
                >
                  Stop
                </button>
                <button
                  className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition"
                  onClick={() => {
                    setTimeLeft(initialTime);
                    setStatus("idle");
                  }}
                >
                  Reset
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      {showEdit && (
        <EditTimer
          onSave={(totalSeconds) => {
            setTimeLeft(totalSeconds);
            setInitialTime(totalSeconds);
            setShowEdit(false);
          }}
          onClose={() => setShowEdit(false)}
        />
      )}
    </div>
  );
}
