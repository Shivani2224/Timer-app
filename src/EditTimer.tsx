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
      className="fixed inset-0 bg-black/50 flex items-center justify-center"
    >
      <div className="bg-white rounded-xl p-6 shadow-xl flex flex-col gap-4">
        <h2 className="text-xl font-bold text-gray-800">Edit Timer</h2>
        <div className="flex gap-4">
          <div className="flex flex-col">
            <label htmlFor="hours" className="text-sm text-gray-600">
              Hours
            </label>
            <input
              id="hours"
              className="w-20 border border-gray-300 rounded px-2 py-1 text-center"
              value={hours}
              onChange={(e) => setHours(handleChange(e.target.value))}
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="minutes" className="text-sm text-gray-600">
              Minutes
            </label>
            <input
              id="minutes"
              className="w-20 border border-gray-300 rounded px-2 py-1 text-center"
              value={minutes}
              onChange={(e) => setMinutes(handleChange(e.target.value))}
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="seconds" className="text-sm text-gray-600">
              Seconds
            </label>
            <input
              id="seconds"
              className="w-20 border border-gray-300 rounded px-2 py-1 text-center"
              value={seconds}
              onChange={(e) => setSeconds(handleChange(e.target.value))}
            />
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg transition"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
