import { useState } from "react";

interface EditTimerProps {
  onSave: (totalSeconds: number) => void;
  onClose: () => void;
}

export default function EditTimer({ onSave, onClose }: EditTimerProps) {
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");

  function handleChange(value: string): string {
    const filtered = value.replace(/[^0-9]/g, "");
    return filtered;
  }

  function handleSave() {
    const h = Number(hours) || 0;
    const m = Number(minutes) || 0;
    const s = Number(seconds) || 0;

    const totalSeconds = h * 3600 + m * 60 + s;
    onSave(totalSeconds);
  }

  return (
    <div
      role="dialog"
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 px-4"
    >
      <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-2xl flex flex-col gap-4 sm:gap-5 w-full max-w-xs sm:max-w-sm">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800">Edit Timer</h2>
        <div className="flex gap-3 sm:gap-4 justify-center">
          <div className="flex flex-col items-center gap-1">
            <label htmlFor="hours" className="text-xs text-[#6b7280] uppercase tracking-wider">
              Hours
            </label>
            <input
              id="hours"
              className="w-16 sm:w-20 bg-gray-50 border border-gray-200 rounded-xl px-2 py-2 text-center text-gray-800 text-base sm:text-lg focus:outline-none focus:border-[#7c5cff]/50 focus:ring-1 focus:ring-[#7c5cff]/25 transition-all"
              value={hours}
              onChange={(e) => setHours(handleChange(e.target.value))}
            />
          </div>
          <div className="flex flex-col items-center gap-1">
            <label htmlFor="minutes" className="text-xs text-[#6b7280] uppercase tracking-wider">
              Minutes
            </label>
            <input
              id="minutes"
              className="w-16 sm:w-20 bg-gray-50 border border-gray-200 rounded-xl px-2 py-2 text-center text-gray-800 text-base sm:text-lg focus:outline-none focus:border-[#7c5cff]/50 focus:ring-1 focus:ring-[#7c5cff]/25 transition-all"
              value={minutes}
              onChange={(e) => setMinutes(handleChange(e.target.value))}
            />
          </div>
          <div className="flex flex-col items-center gap-1">
            <label htmlFor="seconds" className="text-xs text-[#6b7280] uppercase tracking-wider">
              Seconds
            </label>
            <input
              id="seconds"
              className="w-16 sm:w-20 bg-gray-50 border border-gray-200 rounded-xl px-2 py-2 text-center text-gray-800 text-base sm:text-lg focus:outline-none focus:border-[#7c5cff]/50 focus:ring-1 focus:ring-[#7c5cff]/25 transition-all"
              value={seconds}
              onChange={(e) => setSeconds(handleChange(e.target.value))}
            />
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            className="px-4 sm:px-5 py-2 sm:py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 text-sm sm:text-base rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 sm:px-5 py-2 sm:py-2.5 bg-[#7c5cff] hover:bg-[#6a4aee] text-white text-sm sm:text-base font-semibold rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-[#7c5cff]/25 cursor-pointer"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
