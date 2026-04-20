import { useState, useEffect, useRef } from "react";
import {
  formatTime,
  getRingColor,
  calculateProgress,
  secondsToHMS,
  filterNumericInput,
} from "./utils/timerUtils";

import { createRoot, type Root } from "react-dom/client";
import PipTimer from "./PipTimer";

export type TimerStatus = "idle" | "running" | "paused";

export interface TimerData {
  id: string;
  label: string;
  timeLeft: number;
  initialTime: number;
  status: TimerStatus;
  sessions: number;
}

interface TimerCardProps {
  timer: TimerData;
  onStart: (id: string) => void;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onStop: (id: string) => void;
  onReset: (id: string) => void;
  onEdit: (id: string) => void;
  onInlineEdit: (id: string, totalSeconds: number) => void;
  onDelete: (id: string) => void;
  onLabelChange: (id: string, label: string) => void;
  canDelete: boolean;
  solo?: boolean;
}

export default function TimerCard({
  timer,
  onStart,
  onPause,
  onResume,
  onStop,
  onReset,
  onEdit,
  onInlineEdit,
  onDelete,
  onLabelChange,
  canDelete,
  solo = false,
}: TimerCardProps) {
  const { id, timeLeft, initialTime, status, sessions } = timer;
  const pipWindowRef = useRef<Window | null>(null);
  const pipRootRef = useRef<Root | null>(null);
  const [isPip, setIsPip] = useState(false);
  const progress = calculateProgress(status, timeLeft, initialTime);
  const { hours, minutes, seconds } = secondsToHMS(timeLeft);
  const display = formatTime(timeLeft);
  const [isEditing, setIsEditing] = useState(false);
  const [editHours, setEditHours] = useState("");
  const [editMinutes, setEditMinutes] = useState("");
  const [editSeconds, setEditSeconds] = useState("");
  const editContainerRef = useRef<HTMLDivElement | null>(null);
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [editLabel, setEditLabel] = useState("");
  const radius = solo ? 140 : 100;
  const stroke = solo ? 8 : 6;
  const svgSize = radius * 2 + stroke * 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  const ringColor = getRingColor(status, timeLeft);

  const supportsPip =
    typeof window !== "undefined" && "documentPictureInPicture" in window;

  function startEditing() {
    if (status !== "idle") return;
    setEditHours(String(hours));
    setEditMinutes(String(minutes));
    setEditSeconds(String(seconds));
    setIsEditing(true);
  }

  function startLabelEdit() {
    setEditLabel(timer.label);
    setIsEditingLabel(true);
  }

  function saveLabelEdit() {
    const trimmed = editLabel.trim();
    if (trimmed) {
      onLabelChange(id, trimmed);
    }
    setIsEditingLabel(false);
  }

  function cancelLabelEdit() {
    setIsEditingLabel(false);
  }

  function saveEdit() {
    const h = Number(editHours) || 0;
    const m = Number(editMinutes) || 0;
    const s = Number(editSeconds) || 0;
    if (h > 99 || m > 59 || s > 59) {
      cancelEdit();
      return;
    }
    const total = h * 3600 + m * 60 + s;
    if (total === 0) {
      cancelEdit();
      return;
    }
    onInlineEdit(id, total);
    setIsEditing(false);
  }

  function cancelEdit() {
    setIsEditing(false);
  }

  function handleEditKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      saveEdit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancelEdit();
    }
  }

  useEffect(() => {
    if (!isEditing) return;
    function handleClickOutside(e: MouseEvent) {
      if (
        editContainerRef.current &&
        !editContainerRef.current.contains(e.target as Node)
      ) {
        saveEdit();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  });

  useEffect(() => {
    if (!isPip || !pipWindowRef.current || !pipRootRef.current) return;
    pipRootRef.current.render(
      <PipTimer
        display={display}
        progress={progress}
        ringColor={ringColor}
        status={status}
        onPause={() => onPause(id)}
        onResume={() => onResume(id)}
        onStop={() => onStop(id)}
      />
    );
  }, [
    isPip,
    display,
    progress,
    ringColor,
    status,
    id,
    onPause,
    onResume,
    onStop,
  ]);

  async function openPip() {
    if (!supportsPip) return;
    try {
      const pipWindow = await (
        window as unknown as {
          documentPictureInPicture: {
            requestWindow: (opts: {
              width: number;
              height: number;
            }) => Promise<Window>;
          };
        }
      ).documentPictureInPicture.requestWindow({
        width: 300,
        height: 350,
      });

      pipWindowRef.current = pipWindow;

      for (const sheet of document.styleSheets) {
        try {
          if (sheet.href) {
            const link = pipWindow.document.createElement("link");
            link.rel = "stylesheet";
            link.href = sheet.href;
            pipWindow.document.head.appendChild(link);
          } else if (sheet.cssRules) {
            const style = pipWindow.document.createElement("style");
            for (const rule of sheet.cssRules) {
              style.appendChild(
                pipWindow.document.createTextNode(rule.cssText)
              );
            }
            pipWindow.document.head.appendChild(style);
          }
        } catch {
          /* ignore pip styling errors */
        }
      }

      const fontLinks = document.querySelectorAll(
        'link[href*="fonts.googleapis.com"], link[href*="fonts.gstatic.com"]'
      );
      fontLinks.forEach((link) => {
        pipWindow.document.head.appendChild(link.cloneNode(true));
      });

      const container = pipWindow.document.createElement("div");
      container.id = "pip-root";
      pipWindow.document.body.appendChild(container);

      const root = createRoot(container);
      pipRootRef.current = root;

      root.render(
        <PipTimer
          display={display}
          progress={progress}
          ringColor={ringColor}
          status={status}
          onPause={() => onPause(id)}
          onResume={() => onResume(id)}
          onStop={() => onStop(id)}
        />
      );

      setIsPip(true);

      pipWindow.addEventListener("pagehide", () => {
        root.unmount();
        pipRootRef.current = null;
        pipWindowRef.current = null;
        setIsPip(false);
      });
    } catch {
      /* ignore pip styling errors */
    }
  }

  return (
    <div
      className={`relative rounded-2xl sm:rounded-3xl border border-glass-border bg-glass backdrop-blur-xl shadow-2xl flex flex-col items-center ${
        solo
          ? "p-5 sm:p-8 lg:p-10 gap-4 sm:gap-6 lg:gap-8"
          : "p-5 sm:p-6 gap-3 sm:gap-4"
      }`}
    >
      <div className="flex w-full justify-between items-center">
        <div>
          {supportsPip && (
            <button
              onClick={openPip}
              title="Pop out timer"
              aria-label="Pop out timer"
              className="p-1.5 text-muted hover:text-primary transition-colors cursor-pointer"
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
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <rect
                  x="12"
                  y="9"
                  width="8"
                  height="8"
                  rx="1"
                  fill="currentColor"
                  opacity="0.2"
                  stroke="currentColor"
                />
              </svg>
            </button>
          )}
        </div>
        {canDelete && (
          <button
            onClick={() => onDelete(id)}
            title="Remove timer"
            aria-label="Remove timer"
            className="p-1.5 text-muted hover:text-danger transition-colors cursor-pointer"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
      <div>
        {isEditingLabel ? (
          <input
            aria-label="edit timer label"
            autoFocus
            maxLength={20}
            className="text-center text-sm text-muted bg-transparent border-b-2 border-primary outline-none px-2 py-1"
            value={editLabel}
            onChange={(e) => setEditLabel(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveLabelEdit();
              if (e.key === "Escape") cancelLabelEdit();
            }}
            onBlur={saveLabelEdit}
          />
        ) : (
          <span
            className="text-sm text-muted cursor-pointer hover:text-primary transition-colors"
            onClick={startLabelEdit}
            role="button"
            aria-label="Click to edit label"
          >
            {timer.label}
          </span>
        )}
      </div>

      <div
        className={`relative flex items-center justify-center ${
          solo
            ? "w-52 h-52 sm:w-72 sm:h-72 lg:w-96 lg:h-96"
            : "w-40 h-40 sm:w-48 sm:h-48"
        }`}
      >
        <svg
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          className={`w-full h-full ${
            status === "running" ? "progress-ring-animated" : ""
          }`}
        >
          <circle
            cx={radius + stroke}
            cy={radius + stroke}
            r={radius}
            fill="none"
            stroke="rgba(0,0,0,0.06)"
            strokeWidth={stroke}
          />
          {progress > 0 && (
            <circle
              cx={radius + stroke}
              cy={radius + stroke}
              r={radius}
              fill="none"
              stroke={ringColor}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              transform={`rotate(-90 ${radius + stroke} ${radius + stroke})`}
              style={{
                transition: "stroke-dashoffset 0.4s ease, stroke 0.3s ease",
              }}
            />
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {isEditing ? (
            <div
              ref={editContainerRef}
              className="flex items-center gap-1"
              onKeyDown={handleEditKeyDown}
            >
              <input
                aria-label="edit hours"
                autoFocus
                className={`bg-transparent text-center font-bold text-gray-800 font-mono border-b-2 border-primary outline-none ${
                  solo
                    ? "w-12 sm:w-16 lg:w-20 text-3xl sm:text-5xl lg:text-6xl"
                    : "w-8 sm:w-12 text-2xl sm:text-3xl"
                }`}
                value={editHours}
                onChange={(e) =>
                  setEditHours(filterNumericInput(e.target.value))
                }
              />
              <span
                className={`font-bold text-gray-800 font-mono ${
                  solo
                    ? "text-3xl sm:text-5xl lg:text-6xl"
                    : "text-2xl sm:text-3xl"
                }`}
              >
                :
              </span>
              <input
                aria-label="edit minutes"
                className={`bg-transparent text-center font-bold text-gray-800 font-mono border-b-2 border-primary outline-none ${
                  solo
                    ? "w-12 sm:w-16 lg:w-20 text-3xl sm:text-5xl lg:text-6xl"
                    : "w-8 sm:w-12 text-2xl sm:text-3xl"
                }`}
                value={editMinutes}
                onChange={(e) =>
                  setEditMinutes(filterNumericInput(e.target.value))
                }
              />
              <span
                className={`font-bold text-gray-800 font-mono ${
                  solo
                    ? "text-3xl sm:text-5xl lg:text-6xl"
                    : "text-2xl sm:text-3xl"
                }`}
              >
                :
              </span>
              <input
                aria-label="edit seconds"
                className={`bg-transparent text-center font-bold text-gray-800 font-mono border-b-2 border-primary outline-none ${
                  solo
                    ? "w-12 sm:w-16 lg:w-20 text-3xl sm:text-5xl lg:text-6xl"
                    : "w-8 sm:w-12 text-2xl sm:text-3xl"
                }`}
                value={editSeconds}
                onChange={(e) =>
                  setEditSeconds(filterNumericInput(e.target.value))
                }
              />
            </div>
          ) : (
            <span
              className={`font-bold text-gray-800 tracking-widest font-mono ${
                solo
                  ? "text-3xl sm:text-5xl lg:text-6xl"
                  : "text-2xl sm:text-3xl"
              } ${
                status === "idle"
                  ? "cursor-pointer hover:text-primary transition-colors"
                  : ""
              }`}
              onClick={startEditing}
              role={status === "idle" ? "button" : undefined}
              aria-label={status === "idle" ? "Click to edit time" : undefined}
            >
              {display}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {status === "idle" && (
          <>
            <button
              aria-label="Start button"
              onClick={() => onStart(id)}
              disabled={timeLeft === 0}
              className="px-4 sm:px-6 py-2 sm:py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer"
            >
              Start
            </button>
            <button
              aria-label="Edit button"
              onClick={() => onEdit(id)}
              className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gray-100 hover:bg-gray-200 text-muted hover:text-gray-800 text-sm font-semibold rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 border border-gray-200 cursor-pointer"
            >
              Edit
            </button>
          </>
        )}
        {status === "running" && (
          <button
            aria-label="Pause button"
            onClick={() => onPause(id)}
            className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-semibold rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 border border-gray-200 cursor-pointer"
          >
            Pause
          </button>
        )}
        {status === "paused" && (
          <button
            aria-label="Resume button"
            onClick={() => onResume(id)}
            className="px-4 sm:px-6 py-2 sm:py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-primary/25 cursor-pointer"
          >
            Resume
          </button>
        )}
        {status !== "idle" && (
          <>
            <button
              aria-label="Stop button"
              onClick={() => onStop(id)}
              className="px-4 sm:px-6 py-2 sm:py-2.5 bg-danger/10 hover:bg-danger/20 text-danger text-sm font-semibold rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 border border-danger/20 cursor-pointer"
            >
              Stop
            </button>
            <button
              aria-label="Reset button"
              onClick={() => onReset(id)}
              className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gray-100 hover:bg-gray-200 text-muted hover:text-gray-800 text-sm font-semibold rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 border border-gray-200 cursor-pointer"
            >
              Reset
            </button>
          </>
        )}
      </div>

      <div className="flex items-center gap-2 text-muted text-xs">
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          className="text-primary shrink-0"
        >
          <path
            d="M8 1.333A6.667 6.667 0 1 0 14.667 8 6.674 6.674 0 0 0 8 1.333Zm3.06 5.394-3.333 3.333a.667.667 0 0 1-.943 0l-1.667-1.666a.667.667 0 1 1 .943-.943L7.293 8.68l2.862-2.862a.667.667 0 0 1 .943.943l-.038-.034Z"
            fill="currentColor"
          />
        </svg>
        <span>
          Sessions:{" "}
          <span className="text-gray-800 font-semibold">{sessions}</span>
        </span>
      </div>
    </div>
  );
}
