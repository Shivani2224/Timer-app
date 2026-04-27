import EditTimer from "./EditTimer";
import TimerCard from "./TimerCard";
import { useTimers } from "./hooks/useTimers";

export default function App() {
  const {
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
  } = useTimers();

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
