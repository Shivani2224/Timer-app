import type { TimerStatus } from "./TimerCard";

interface PipTimerProps {
  display: string;
  progress: number;
  ringColor: string;
  status: TimerStatus;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

export default function PipTimer({
  display,
  progress,
  ringColor,
  status,
  onPause,
  onResume,
  onStop,
}: PipTimerProps) {
  const radius = 90;
  const stroke = 6;
  const svgSize = radius * 2 + stroke * 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Poppins', sans-serif",
        background: "linear-gradient(135deg, #f0f0f5 0%, #e8e6f0 100%)",
        padding: "16px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <div
          style={{
            position: "relative",
            width: 200,
            height: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            viewBox={`0 0 ${svgSize} ${svgSize}`}
            width="100%"
            height="100%"
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
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontSize: "28px",
                fontWeight: 700,
                color: "#1f2937",
                letterSpacing: "0.1em",
                fontFamily: "monospace",
              }}
            >
              {display}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          {status === "running" && (
            <button
              onClick={onPause}
              style={{
                padding: "8px 20px",
                background: "#f3f4f6",
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                fontSize: "14px",
                fontWeight: 600,
                color: "#1f2937",
                cursor: "pointer",
              }}
            >
              Pause
            </button>
          )}
          {status === "paused" && (
            <button
              onClick={onResume}
              style={{
                padding: "8px 20px",
                background: "#7c5cff",
                border: "none",
                borderRadius: "12px",
                fontSize: "14px",
                fontWeight: 600,
                color: "white",
                cursor: "pointer",
              }}
            >
              Resume
            </button>
          )}
          {status !== "idle" && (
            <button
              onClick={onStop}
              style={{
                padding: "8px 20px",
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: "12px",
                fontSize: "14px",
                fontWeight: 600,
                color: "#ef4444",
                cursor: "pointer",
              }}
            >
              Stop
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
