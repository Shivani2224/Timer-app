import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

describe("Focus Timer", () => {
  it("should display the Timer heading and subtitle", () => {
    render(<App />);
    expect(screen.getByText("Timer")).toBeInTheDocument();
    expect(
      screen.getByText("Stay productive, stay focused")
    ).toBeInTheDocument();
  });

  describe("Default Timer", () => {
    it("should show 00:02:00 on load", () => {
      render(<App />);
      expect(screen.getByText("00:02:00")).toBeInTheDocument();
    });
  });

  describe("Edit Timer", () => {
    it("should display an Edit button", () => {
      render(<App />);
      expect(
        screen.getByRole("button", { name: /^edit$/i })
      ).toBeInTheDocument();
    });

    it("should open a popup when Edit button is clicked", async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByRole("button", { name: /^edit$/i }));

      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("should only accept numbers, not letters or special characters", async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByRole("button", { name: /^edit$/i }));

      const minutesInput = screen.getByLabelText(/minutes/i);
      await user.clear(minutesInput);
      await user.type(minutesInput, "abc!@#");

      expect(minutesInput).toHaveValue("");
    });

    it("should not accept negative numbers", async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByRole("button", { name: /^edit$/i }));

      const minutesInput = screen.getByLabelText(/minutes/i);
      await user.clear(minutesInput);
      await user.type(minutesInput, "-5");

      expect(minutesInput).not.toHaveValue("-5");
    });

    it("should show error when seconds exceed 59", async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByRole("button", { name: /^edit$/i }));

      const secondsInput = screen.getByLabelText(/seconds/i);
      await user.clear(secondsInput);
      await user.type(secondsInput, "75");

      expect(screen.getByText("Minutes and seconds cannot be more than 59")).toBeInTheDocument();
    });

    it("should show error when minutes exceed 59", async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByRole("button", { name: /^edit$/i }));

      const minutesInput = screen.getByLabelText(/minutes/i);
      await user.clear(minutesInput);
      await user.type(minutesInput, "75");

      expect(screen.getByText("Minutes and seconds cannot be more than 59")).toBeInTheDocument();
    });

    it("should not save when minutes or seconds exceed 59", async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByRole("button", { name: /^edit$/i }));

      const minutesInput = screen.getByLabelText(/minutes/i);
      await user.clear(minutesInput);
      await user.type(minutesInput, "75");

      await user.click(screen.getByRole("button", { name: /save/i }));

      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("should show error when all fields are zero", async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByRole("button", { name: /^edit$/i }));

      expect(screen.getByText("Enter a value in at least one field")).toBeInTheDocument();
    });

    it("should not save when all fields are zero", async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByRole("button", { name: /^edit$/i }));

      await user.click(screen.getByRole("button", { name: /save/i }));

      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("should show error when hours exceed 99", async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByRole("button", { name: /^edit$/i }));

      const hoursInput = screen.getByLabelText(/hours/i);
      await user.clear(hoursInput);
      await user.type(hoursInput, "100");

      expect(screen.getByText("Hours cannot be more than 99")).toBeInTheDocument();
    });

    it("should not save when hours exceed 99", async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByRole("button", { name: /^edit$/i }));

      const hoursInput = screen.getByLabelText(/hours/i);
      await user.clear(hoursInput);
      await user.type(hoursInput, "100");

      await user.click(screen.getByRole("button", { name: /save/i }));

      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("should clear hours error when value is corrected to 99 or below", async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByRole("button", { name: /^edit$/i }));

      const hoursInput = screen.getByLabelText(/hours/i);
      await user.clear(hoursInput);
      await user.type(hoursInput, "100");

      expect(screen.getByText("Hours cannot be more than 99")).toBeInTheDocument();

      await user.clear(hoursInput);
      await user.type(hoursInput, "50");

      expect(screen.queryByText("Hours cannot be more than 99")).not.toBeInTheDocument();
    });

    it("should clear error when value is corrected to 59 or below", async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByRole("button", { name: /^edit$/i }));

      const minutesInput = screen.getByLabelText(/minutes/i);
      await user.clear(minutesInput);
      await user.type(minutesInput, "75");

      expect(screen.getByText("Minutes and seconds cannot be more than 59")).toBeInTheDocument();

      await user.clear(minutesInput);
      await user.type(minutesInput, "30");

      expect(screen.queryByText("Minutes and seconds cannot be more than 59")).not.toBeInTheDocument();
    });
  });

  describe("Session Counter", () => {
    it("should show sessions completed as 0 initially", () => {
      render(<App />);
      expect(screen.getByText("Sessions:")).toBeInTheDocument();
      expect(screen.getByText("0")).toBeInTheDocument();
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

  describe("Pause Timer", () => {
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

  describe("Stop Timer", () => {
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

  describe("Reset Timer", () => {
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

  describe("Sound Alert", () => {
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

    it("should increment session count when timer completes", () => {
      const playMock = vi.fn().mockResolvedValue(undefined);
      vi.spyOn(window.HTMLMediaElement.prototype, "play").mockImplementation(
        playMock
      );

      render(<App />);

      fireEvent.click(screen.getByRole("button", { name: /start/i }));

      act(() => {
        vi.advanceTimersByTime(120000);
      });

      expect(screen.getByText("1")).toBeInTheDocument();
    });
  });

  describe("Multiple Timers", () => {
    it("should display an Add Timer button", () => {
      render(<App />);
      expect(
        screen.getByRole("button", { name: /add timer/i })
      ).toBeInTheDocument();
    });

    it("should add a new timer when Add Timer is clicked", () => {
      render(<App />);

      fireEvent.click(screen.getByRole("button", { name: /add timer/i }));

      const timers = screen.getAllByText("00:02:00");
      expect(timers).toHaveLength(2);
    });

    it("should show delete button only when multiple timers exist", () => {
      render(<App />);


      expect(
        screen.queryByTitle("Remove timer")
      ).not.toBeInTheDocument();


      fireEvent.click(screen.getByRole("button", { name: /add timer/i }));


      const deleteButtons = screen.getAllByTitle("Remove timer");
      expect(deleteButtons.length).toBeGreaterThan(0);
    });

    it("should remove a timer when delete is clicked", () => {
      render(<App />);


      fireEvent.click(screen.getByRole("button", { name: /add timer/i }));
      expect(screen.getAllByText("00:02:00")).toHaveLength(2);


      fireEvent.click(screen.getAllByTitle("Remove timer")[0]);
      expect(screen.getAllByText("00:02:00")).toHaveLength(1);
    });

    it("should run multiple timers independently", () => {
      vi.useFakeTimers();

      render(<App />);


      fireEvent.click(screen.getByRole("button", { name: /add timer/i }));


      const startButtons = screen.getAllByRole("button", { name: /start/i });
      fireEvent.click(startButtons[0]);

      act(() => {
        vi.advanceTimersByTime(5000);
      });


      expect(screen.getByText("00:01:55")).toBeInTheDocument();
      expect(screen.getByText("00:02:00")).toBeInTheDocument();

      vi.useRealTimers();
    });

    it("should edit the correct timer when multiple exist", async () => {
      const user = userEvent.setup();
      render(<App />);


      await user.click(screen.getByRole("button", { name: /add timer/i }));


      const editButtons = screen.getAllByRole("button", { name: /^edit$/i });
      await user.click(editButtons[0]);

      expect(screen.getByRole("dialog")).toBeInTheDocument();


      const minutesInput = screen.getByLabelText(/minutes/i);
      await user.clear(minutesInput);
      await user.type(minutesInput, "5");
      await user.click(screen.getByRole("button", { name: /save/i }));


      expect(screen.getByText("00:05:00")).toBeInTheDocument();
      expect(screen.getByText("00:02:00")).toBeInTheDocument();
    });
  });
});
