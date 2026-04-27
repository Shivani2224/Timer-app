import { describe, it, expect } from "vitest";
import {
  formatTime,
  secondsToHMS,
  hmsToSeconds,
  filterNumericInput,
  getRingColor,
  calculateProgress,
} from "./timerUtils";

describe("timerUtils", () => {
  describe("formatTime", () => {
    it("returns 00:00:00 for 0", () => {
      expect(formatTime(0)).toBe("00:00:00");
    });

    it("returns 00:02:00 for 120", () => {
      expect(formatTime(120)).toBe("00:02:00");
    });

    it("returns 01:01:01 for 3661", () => {
      expect(formatTime(3661)).toBe("01:01:01");
    });

    it("handles 24 hours (86400)", () => {
      expect(formatTime(86400)).toBe("24:00:00");
    });
  });

  describe("secondsToHMS", () => {
    it("splits 3661 into 1h 1m 1s", () => {
      expect(secondsToHMS(3661)).toEqual({ hours: 1, minutes: 1, seconds: 1 });
    });

    it("returns all zeros for 0", () => {
      expect(secondsToHMS(0)).toEqual({ hours: 0, minutes: 0, seconds: 0 });
    });
  });

  describe("hmsToSeconds", () => {
    it("converts (1, 1, 1) to 3661", () => {
      expect(hmsToSeconds(1, 1, 1)).toBe(3661);
    });

    it("returns 0 for all zeros", () => {
      expect(hmsToSeconds(0, 0, 0)).toBe(0);
    });
  });

  describe("filterNumericInput", () => {
    it("strips letters", () => {
      expect(filterNumericInput("abc")).toBe("");
    });

    it("strips special characters", () => {
      expect(filterNumericInput("12!@3")).toBe("123");
    });

    it("strips negative sign", () => {
      expect(filterNumericInput("-5")).toBe("5");
    });

    it("keeps valid numbers unchanged", () => {
      expect(filterNumericInput("42")).toBe("42");
    });
  });

  describe("getRingColor", () => {
    it("returns purple when status is idle", () => {
      expect(getRingColor("idle", 60)).toBe("#7c5cff");
    });

    it("returns red when timeLeft <= 5 and running", () => {
      expect(getRingColor("running", 5)).toBe("#ef4444");
      expect(getRingColor("running", 1)).toBe("#ef4444");
    });

    it("returns yellow when timeLeft <= 10 and running", () => {
      expect(getRingColor("running", 10)).toBe("#eab308");
      expect(getRingColor("running", 6)).toBe("#eab308");
    });

    it("returns purple when timeLeft > 10 and running", () => {
      expect(getRingColor("running", 60)).toBe("#7c5cff");
    });
  });

  describe("calculateProgress", () => {
    it("returns 1 when status is idle", () => {
      expect(calculateProgress("idle", 60, 120)).toBe(1);
    });

    it("returns 0.5 when halfway through", () => {
      expect(calculateProgress("running", 60, 120)).toBe(0.5);
    });

    it("returns 0 when initialTime is 0", () => {
      expect(calculateProgress("running", 0, 0)).toBe(0);
    });
  });
});
