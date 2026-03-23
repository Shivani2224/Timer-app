import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

describe("Timer", () => {
  it("should display the timer heading", () => {
    render(<App />);
    expect(screen.getByText("Timer")).toBeInTheDocument();
  });

  describe("Default Timer", () => {
    it("should show 00:02:00 on load", () => {
      render(<App />);
      expect(screen.getByText("00:02:00")).toBeInTheDocument();
    });
  });

  describe("Edit Timer", () => {
    it("should display an Edit Timer button", () => {
      render(<App />);
      expect(
        screen.getByRole("button", { name: /edit timer/i })
      ).toBeInTheDocument();
    });

    it("should open a popup when Edit Timer button is clicked", async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByRole("button", { name: /edit timer/i }));

      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("should only accept numbers, not letters or special characters", async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByRole("button", { name: /edit timer/i }));

      const minutesInput = screen.getByLabelText(/minutes/i);
      await user.clear(minutesInput);
      await user.type(minutesInput, "abc!@#");

      expect(minutesInput).toHaveValue("");
    });

    it("should not accept negative numbers", async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByRole("button", { name: /edit timer/i }));

      const minutesInput = screen.getByLabelText(/minutes/i);
      await user.clear(minutesInput);
      await user.type(minutesInput, "-5");

      expect(minutesInput).not.toHaveValue("-5");
    });

    it("should auto-convert seconds greater than 59", async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByRole("button", { name: /edit timer/i }));

      const secondsInput = screen.getByLabelText(/seconds/i);
      const minutesInput = screen.getByLabelText(/minutes/i);

      await user.clear(secondsInput);
      await user.type(secondsInput, "75");

      const saveButton = screen.getByRole("button", { name: /save/i });
      await user.click(saveButton);

      expect(screen.getByText(/01:15/)).toBeInTheDocument();
    });

    it("should auto-convert minutes greater than 59", async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByRole("button", { name: /edit timer/i }));

      const minutesInput = screen.getByLabelText(/minutes/i);
      const hoursInput = screen.getByLabelText(/hours/i);

      await user.clear(minutesInput);
      await user.type(minutesInput, "75");

      const saveButton = screen.getByRole("button", { name: /save/i });
      await user.click(saveButton);

      expect(screen.getByText(/01:15:00/)).toBeInTheDocument();
    });
  });

  describe("Start Timer", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should display a Start button", () => {
      render(<App />);
      expect(
        screen.getByRole("button", { name: /start/i })
      ).toBeInTheDocument();
    });

    it("should begin countdown when Start is clicked", () => {
      render(<App />);

      fireEvent.click(screen.getByRole("button", { name: /start/i }));

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(screen.getByText("00:01:59")).toBeInTheDocument();
    });

    it("should show Pause and Reset buttons after starting", () => {
      render(<App />);

      fireEvent.click(screen.getByRole("button", { name: /start/i }));

      expect(
        screen.getByRole("button", { name: /pause/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /reset/i })
      ).toBeInTheDocument();
    });
  });

  describe("US-3: Pause Timer", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should freeze the countdown when Pause is clicked", () => {
      render(<App />);

      fireEvent.click(screen.getByRole("button", { name: /start/i }));

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      fireEvent.click(screen.getByRole("button", { name: /pause/i }));

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(screen.getByText("00:01:57")).toBeInTheDocument();
    });

    it("should resume countdown when Resume is clicked", () => {
      render(<App />);

      fireEvent.click(screen.getByRole("button", { name: /start/i }));

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      fireEvent.click(screen.getByRole("button", { name: /pause/i }));

      fireEvent.click(screen.getByRole("button", { name: /resume/i }));

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(screen.getByText("00:01:55")).toBeInTheDocument();
    });
  });

  describe("US-4: Stop Timer", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should stop the timer completely", () => {
      render(<App />);

      fireEvent.click(screen.getByRole("button", { name: /start/i }));

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      fireEvent.click(screen.getByRole("button", { name: /stop/i }));

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(screen.getByText("00:02:00")).toBeInTheDocument();
    });

    it("should return to the default time (02:00)", () => {
      render(<App />);

      fireEvent.click(screen.getByRole("button", { name: /start/i }));

      act(() => {
        vi.advanceTimersByTime(10000);
      });

      fireEvent.click(screen.getByRole("button", { name: /stop/i }));

      expect(screen.getByText("00:02:00")).toBeInTheDocument();

      expect(
        screen.getByRole("button", { name: /start/i })
      ).toBeInTheDocument();
    });
  });

  describe("US-5: Reset Timer", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should reset to the originally set time", () => {
      render(<App />);

      fireEvent.click(screen.getByRole("button", { name: /start/i }));

      act(() => {
        vi.advanceTimersByTime(10000);
      });

      fireEvent.click(screen.getByRole("button", { name: /reset/i }));

      expect(screen.getByText("00:02:00")).toBeInTheDocument();
    });

    it("should stop and return to idle after reset", () => {
      render(<App />);

      fireEvent.click(screen.getByRole("button", { name: /start/i }));

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      fireEvent.click(screen.getByRole("button", { name: /reset/i }));

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(screen.getByText("00:02:00")).toBeInTheDocument();

      expect(
        screen.getByRole("button", { name: /start/i })
      ).toBeInTheDocument();
    });
  });

  describe("US-6: Sound Alert", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
      vi.restoreAllMocks();
    });

    it("should play a sound when timer reaches 00:00:00", () => {
      const playMock = vi.fn().mockResolvedValue(undefined);
      vi.spyOn(window.HTMLMediaElement.prototype, "play").mockImplementation(
        playMock
      );

      render(<App />);

      fireEvent.click(screen.getByRole("button", { name: /start/i }));

      act(() => {
        vi.advanceTimersByTime(120000);
      });

      expect(playMock).toHaveBeenCalled();
    });
  });
});
