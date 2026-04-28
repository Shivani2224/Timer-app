import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
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

  describe("browser notifications", () => {
    let notificationInstances: Array<{
      title: string;
      options?: NotificationOptions;
    }>;
    let requestPermissionMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      notificationInstances = [];
      requestPermissionMock = vi.fn(() => Promise.resolve("granted"));

      class MockNotification {
        static permission: NotificationPermission = "granted";
        static requestPermission = requestPermissionMock;
        constructor(title: string, options?: NotificationOptions) {
          notificationInstances.push({ title, options });
        }
      }
      vi.stubGlobal("Notification", MockNotification);
      vi.spyOn(window.HTMLMediaElement.prototype, "play").mockResolvedValue(
        undefined
      );
    });

    afterEach(() => {
      vi.unstubAllGlobals();
      vi.restoreAllMocks();
    });

    it("requests notification permission on mount when permission is default", () => {
      (globalThis.Notification as unknown as { permission: string }).permission =
        "default";
      renderHook(() => useTimers());
      expect(requestPermissionMock).toHaveBeenCalledTimes(1);
    });

    it("does not request permission when already granted", () => {
      (globalThis.Notification as unknown as { permission: string }).permission =
        "granted";
      renderHook(() => useTimers());
      expect(requestPermissionMock).not.toHaveBeenCalled();
    });

    it("does not request permission when denied", () => {
      (globalThis.Notification as unknown as { permission: string }).permission =
        "denied";
      renderHook(() => useTimers());
      expect(requestPermissionMock).not.toHaveBeenCalled();
    });

    it("fires a Notification when a timer's session count increases and permission is granted", () => {
      (globalThis.Notification as unknown as { permission: string }).permission =
        "granted";
      const { result } = renderHook(() => useTimers());
      const id = result.current.timers[0].id;
      const label = result.current.timers[0].label;

      act(() => result.current.updateTimer(id, { sessions: 1 }));

      expect(notificationInstances).toHaveLength(1);
      expect(notificationInstances[0].title).toBe("Timer complete");
      expect(notificationInstances[0].options?.body).toBe(label);
    });

    it("does not fire Notification when permission is denied", () => {
      (globalThis.Notification as unknown as { permission: string }).permission =
        "denied";
      const { result } = renderHook(() => useTimers());
      const id = result.current.timers[0].id;

      act(() => result.current.updateTimer(id, { sessions: 1 }));

      expect(notificationInstances).toHaveLength(0);
    });

    it("does not fire Notification on initial mount", () => {
      (globalThis.Notification as unknown as { permission: string }).permission =
        "granted";
      renderHook(() => useTimers());

      expect(notificationInstances).toHaveLength(0);
    });
  });

  describe("Date.now() accuracy", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("starting a timer sets endsAt = now + timeLeft seconds", () => {
      vi.setSystemTime(new Date(1_000_000_000_000));
      const { result } = renderHook(() => useTimers());
      const id = result.current.timers[0].id;
      const initial = result.current.timers[0].timeLeft;

      act(() => result.current.handleStart(id));

      expect(result.current.timers[0].endsAt).toBe(
        1_000_000_000_000 + initial * 1000
      );
    });

    it("derives timeLeft from endsAt on each tick (no drift)", () => {
      vi.setSystemTime(new Date(0));
      const { result } = renderHook(() => useTimers());
      const id = result.current.timers[0].id;

      act(() => result.current.handleStart(id));

      // Advance 60s — display should be exactly 60s less, regardless of tick scheduling
      act(() => {
        vi.advanceTimersByTime(60_000);
      });

      expect(result.current.timers[0].timeLeft).toBe(60);
    });

    it("recovers correctly when system clock jumps forward (background tab)", () => {
      vi.setSystemTime(new Date(0));
      const { result } = renderHook(() => useTimers());
      const id = result.current.timers[0].id;

      act(() => result.current.handleStart(id));

      // Simulate the tab being backgrounded for 30s with no ticks firing,
      // then a single tick after the clock has advanced
      vi.setSystemTime(new Date(30_000));
      act(() => {
        vi.advanceTimersByTime(1_000);
      });

      // Display reflects real elapsed time, not number of ticks
      expect(result.current.timers[0].timeLeft).toBeLessThanOrEqual(89);
      expect(result.current.timers[0].timeLeft).toBeGreaterThanOrEqual(88);
    });

    it("pause freezes timeLeft based on Date.now()", () => {
      vi.setSystemTime(new Date(0));
      const { result } = renderHook(() => useTimers());
      const id = result.current.timers[0].id;

      act(() => result.current.handleStart(id));

      vi.setSystemTime(new Date(5_000));
      act(() => result.current.handlePause(id));

      const frozen = result.current.timers[0].timeLeft;
      expect(frozen).toBe(115);
      expect(result.current.timers[0].endsAt).toBeNull();

      // Time passes while paused — value must not change
      vi.setSystemTime(new Date(60_000));
      act(() => {
        vi.advanceTimersByTime(1_000);
      });
      expect(result.current.timers[0].timeLeft).toBe(115);
    });

    it("resume recomputes endsAt from frozen timeLeft", () => {
      vi.setSystemTime(new Date(0));
      const { result } = renderHook(() => useTimers());
      const id = result.current.timers[0].id;

      act(() => result.current.handleStart(id));

      vi.setSystemTime(new Date(5_000));
      act(() => result.current.handlePause(id));

      vi.setSystemTime(new Date(60_000));
      act(() => result.current.handleResume(id));

      // endsAt = 60_000 + 115 * 1000 = 175_000
      expect(result.current.timers[0].endsAt).toBe(175_000);
    });
  });
});
