import { describe, it, expect } from "vitest";
import {
  formatTime,
  secondsToHMS,
  hmsToSeconds,
  filterNumericInput,
  getRingColor,
  calculateProgress,
} from "./timerUtils";

describe("formatTime", () => {
  it("zero-pads hours, minutes, and seconds", () => {
    expect(formatTime(0)).toBe("00:00:00");
    expect(formatTime(5)).toBe("00:00:05");
    expect(formatTime(65)).toBe("00:01:05");
  });

  it("formats values spanning hours", () => {
    expect(formatTime(3600)).toBe("01:00:00");
    expect(formatTime(3661)).toBe("01:01:01");
    expect(formatTime(3600 * 12 + 60 * 34 + 56)).toBe("12:34:56");
  });

  it("supports 99-hour maximum values without truncation", () => {
    expect(formatTime(99 * 3600 + 59 * 60 + 59)).toBe("99:59:59");
  });
});

describe("secondsToHMS", () => {
  it("splits zero into all zero components", () => {
    expect(secondsToHMS(0)).toEqual({ hours: 0, minutes: 0, seconds: 0 });
  });

  it("splits a mid-range value into hours/minutes/seconds", () => {
    expect(secondsToHMS(3661)).toEqual({ hours: 1, minutes: 1, seconds: 1 });
  });

  it("handles sub-minute values with zeroed hours and minutes", () => {
    expect(secondsToHMS(45)).toEqual({ hours: 0, minutes: 0, seconds: 45 });
  });

  it("is the inverse of hmsToSeconds", () => {
    const total = 12 * 3600 + 34 * 60 + 56;
    const parts = secondsToHMS(total);
    expect(hmsToSeconds(parts.hours, parts.minutes, parts.seconds)).toBe(total);
  });
});

describe("hmsToSeconds", () => {
  it("returns 0 for all zeros", () => {
    expect(hmsToSeconds(0, 0, 0)).toBe(0);
  });

  it("converts hours to seconds", () => {
    expect(hmsToSeconds(1, 0, 0)).toBe(3600);
  });

  it("converts minutes to seconds", () => {
    expect(hmsToSeconds(0, 1, 0)).toBe(60);
  });

  it("sums hours, minutes, and seconds", () => {
    expect(hmsToSeconds(2, 30, 15)).toBe(2 * 3600 + 30 * 60 + 15);
  });
});

describe("filterNumericInput", () => {
  it("keeps only digits", () => {
    expect(filterNumericInput("123")).toBe("123");
    expect(filterNumericInput("1a2b3c")).toBe("123");
  });

  it("strips letters, symbols, and whitespace", () => {
    expect(filterNumericInput("abc")).toBe("");
    expect(filterNumericInput("1 2-3")).toBe("123");
    expect(filterNumericInput("$9.99")).toBe("999");
  });

  it("returns an empty string when input is empty", () => {
    expect(filterNumericInput("")).toBe("");
  });
});

describe("getRingColor", () => {
  it("returns the primary color when status is idle regardless of timeLeft", () => {
    expect(getRingColor("idle", 120)).toBe("#7c5cff");
    expect(getRingColor("idle", 3)).toBe("#7c5cff");
    expect(getRingColor("idle", 0)).toBe("#7c5cff");
  });

  it("returns red when timeLeft is 5 or less and running", () => {
    expect(getRingColor("running", 5)).toBe("#ef4444");
    expect(getRingColor("running", 1)).toBe("#ef4444");
    expect(getRingColor("running", 0)).toBe("#ef4444");
  });

  it("returns yellow when timeLeft is between 6 and 10 inclusive", () => {
    expect(getRingColor("running", 10)).toBe("#eab308");
    expect(getRingColor("running", 6)).toBe("#eab308");
  });

  it("returns the primary color when timeLeft is greater than 10", () => {
    expect(getRingColor("running", 11)).toBe("#7c5cff");
    expect(getRingColor("paused", 60)).toBe("#7c5cff");
  });
});

describe("calculateProgress", () => {
  it("returns 1 when status is idle", () => {
    expect(calculateProgress("idle", 60, 120)).toBe(1);
    expect(calculateProgress("idle", 0, 120)).toBe(1);
  });

  it("returns the ratio of timeLeft to initialTime when running", () => {
    expect(calculateProgress("running", 60, 120)).toBe(0.5);
    expect(calculateProgress("running", 30, 120)).toBe(0.25);
    expect(calculateProgress("paused", 120, 120)).toBe(1);
  });

  it("returns 0 when initialTime is 0 and status is not idle", () => {
    expect(calculateProgress("running", 0, 0)).toBe(0);
  });

  it("returns 0 when running and timeLeft is 0", () => {
    expect(calculateProgress("running", 0, 120)).toBe(0);
  });
});
