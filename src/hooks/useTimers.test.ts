import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTimers } from "./useTimers";

describe("useTimers", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("initialization", () => {
    it("starts with one timer using default values", () => {
      const { result } = renderHook(() => useTimers());

      expect(result.current.timers).toHaveLength(1);
      expect(result.current.timers[0].timeLeft).toBe(120);
      expect(result.current.timers[0].initialTime).toBe(120);
    });

    it("default timer is idle with timeLeft equal to initialTime", () => {
      const { result } = renderHook(() => useTimers());

      const t = result.current.timers[0];
      expect(t.status).toBe("idle");
      expect(t.timeLeft).toBe(t.initialTime);
      expect(t.sessions).toBe(0);
    });
  });

  describe("timer actions", () => {
    it("handleStart sets timer status to running", () => {
      const { result } = renderHook(() => useTimers());
      const id = result.current.timers[0].id;

      act(() => result.current.handleStart(id));

      expect(result.current.timers[0].status).toBe("running");
    });

    it("handlePause sets timer status to paused", () => {
      const { result } = renderHook(() => useTimers());
      const id = result.current.timers[0].id;

      act(() => result.current.handleStart(id));
      act(() => result.current.handlePause(id));

      expect(result.current.timers[0].status).toBe("paused");
    });

    it("handleResume sets timer status back to running", () => {
      const { result } = renderHook(() => useTimers());
      const id = result.current.timers[0].id;

      act(() => result.current.handleStart(id));
      act(() => result.current.handlePause(id));
      act(() => result.current.handleResume(id));

      expect(result.current.timers[0].status).toBe("running");
    });

    it("handleStop resets status to idle and timeLeft to initialTime", () => {
      const { result } = renderHook(() => useTimers());
      const id = result.current.timers[0].id;
      const initial = result.current.timers[0].initialTime;

      act(() => result.current.handleStart(id));
      act(() => result.current.updateTimer(id, { timeLeft: 30 }));
      act(() => result.current.handleStop(id));

      expect(result.current.timers[0].status).toBe("idle");
      expect(result.current.timers[0].timeLeft).toBe(initial);
    });

    it("handleReset resets status to idle and timeLeft to initialTime", () => {
      const { result } = renderHook(() => useTimers());
      const id = result.current.timers[0].id;
      const initial = result.current.timers[0].initialTime;

      act(() => result.current.handleStart(id));
      act(() => result.current.updateTimer(id, { timeLeft: 10 }));
      act(() => result.current.handleReset(id));

      expect(result.current.timers[0].status).toBe("idle");
      expect(result.current.timers[0].timeLeft).toBe(initial);
    });
  });

  describe("managing multiple timers", () => {
    it("handleAddTimer adds a new timer to the array", () => {
      const { result } = renderHook(() => useTimers());

      act(() => result.current.handleAddTimer());

      expect(result.current.timers).toHaveLength(2);
    });

    it("handleDelete removes the correct timer by id", () => {
      const { result } = renderHook(() => useTimers());

      act(() => result.current.handleAddTimer());
      const idToDelete = result.current.timers[0].id;
      const idToKeep = result.current.timers[1].id;

      act(() => result.current.handleDelete(idToDelete));

      expect(result.current.timers).toHaveLength(1);
      expect(result.current.timers[0].id).toBe(idToKeep);
    });

    it("updateTimer applies partial updates to the correct timer", () => {
      const { result } = renderHook(() => useTimers());

      act(() => result.current.handleAddTimer());
      const targetId = result.current.timers[1].id;

      act(() =>
        result.current.updateTimer(targetId, { label: "Custom", timeLeft: 99 })
      );

      expect(result.current.timers[0].label).not.toBe("Custom");
      expect(result.current.timers[1].label).toBe("Custom");
      expect(result.current.timers[1].timeLeft).toBe(99);
    });

    it("multiple timers maintain independent state", () => {
      const { result } = renderHook(() => useTimers());

      act(() => result.current.handleAddTimer());
      const [first, second] = result.current.timers;

      act(() => result.current.handleStart(first.id));

      expect(result.current.timers[0].status).toBe("running");
      expect(result.current.timers[1].status).toBe("idle");

      act(() => result.current.handlePause(first.id));
      act(() => result.current.handleStart(second.id));

      expect(result.current.timers[0].status).toBe("paused");
      expect(result.current.timers[1].status).toBe("running");
    });
  });

  describe("editingId", () => {
    it("setEditingId tracks which timer is being edited", () => {
      const { result } = renderHook(() => useTimers());
      const id = result.current.timers[0].id;

      expect(result.current.editingId).toBeNull();

      act(() => result.current.setEditingId(id));
      expect(result.current.editingId).toBe(id);

      act(() => result.current.setEditingId(null));
      expect(result.current.editingId).toBeNull();
    });
  });

  describe("handleLabelChange", () => {
    it("updates the label of the correct timer", () => {
      const { result } = renderHook(() => useTimers());
      const id = result.current.timers[0].id;

      act(() => result.current.handleLabelChange(id, "Focus"));

      expect(result.current.timers[0].label).toBe("Focus");
    });
  });
});
