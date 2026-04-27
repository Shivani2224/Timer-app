import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { StrictMode } from "react";
import { render, screen, act, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

describe("Focus Timer", () => {
  beforeEach(() => {
    localStorage.clear();
  });

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



  describe("Session Counter", () => {
    it("should show sessions completed as 0 initially", () => {
      render(<App />);
      expect(screen.getByText("Sessions:")).toBeInTheDocument();
      expect(screen.getByText("0")).toBeInTheDocument();
    });
  });

  describe("Timer Label", () => {
    it("should display default label ", () => {
      render(<App />);
      expect(screen.getByText(/Timer \d+/)).toBeInTheDocument();
    });
    it("should label the first timer as 'Timer 1' under StrictMode", () => {
      render(
        <StrictMode>
          <App />
        </StrictMode>
      );
      expect(screen.getByText("Timer 1")).toBeInTheDocument();
    });
    it("should label a newly added timer as 'Timer 2' under StrictMode", async () => {
      const user = userEvent.setup();
      render(
        <StrictMode>
          <App />
        </StrictMode>
      );
      await user.click(screen.getByRole("button", { name: /add new timer/i }));
      expect(screen.getByText("Timer 1")).toBeInTheDocument();
      expect(screen.getByText("Timer 2")).toBeInTheDocument();
    });
    it("should become editable when clicked", async () => {
      const user = userEvent.setup();
      render(<App />);
      await user.click(
        screen.getByRole("button", { name: /click to edit label/i })
      );
      expect(screen.getByLabelText(/edit timer label/i)).toBeInTheDocument();
    });
    it("should save new label on Enter", async () => {
      const user = userEvent.setup();
      render(<App />);
      const label = screen.getByRole("button", {
        name: /click to edit label/i,
      });
      await user.click(label);
      const input = screen.getByLabelText(/edit timer label/i);
      await user.clear(input);
      await user.type(input, "work");
      await user.keyboard("{Enter}");
      expect(screen.getByText("work")).toBeInTheDocument();
    });

    it("should save new label on Escape", async () => {
      const user = userEvent.setup();
      render(<App />);
      const label = screen.getByRole("button", {
        name: /click to edit label/i,
      });
      const originalText = label.textContent;
      await user.click(label);
      const input = screen.getByLabelText(/edit timer label/i);
      await user.clear(input);
      await user.type(input, "Something Else");
      await user.keyboard("{Escape}");
      expect(screen.getByText(originalText!)).toBeInTheDocument();
    });
    it("should save new label on blur", async () => {
      const user = userEvent.setup();
      render(<App />);
      const label = screen.getByRole("button", {
        name: /click to edit label/i,
      });
      await user.click(label);
      const input = screen.getByLabelText(/edit timer label/i);
      await user.clear(input);
      await user.type(input, "Break");
      await user.click(document.body);
      expect(screen.getByText("Break")).toBeInTheDocument();
    });

    it("should enforce max 20 charater limit", async () => {
      const user = userEvent.setup();
      render(<App />)
      await user.click(screen.getByRole("button", { name: /click to edit label/i }))
      const input = screen.getByLabelText(/edit timer label/i)
      await user.clear(input);
      await user.type(input, "this is a very long label name")
      expect(input).toHaveValue("this is a very long ");
    })

    it("should show different labels for multiple timers", async () => {
      render(<App />)
      fireEvent.click(screen.getByRole("button", { name: /add.*timer/i }))
      const label = screen.getAllByRole("button", {name: /click to edit label/i})
      expect(label).toHaveLength(2)
      expect(label[0].textContent).not.toBe(label[1].textContent)
    })

    it("should not save empty label", async () => {
      const user = userEvent.setup();
      render(<App />);
      const label = screen.getByRole("button", { name: /click to edit label/i })
      const originalText = label.textContent;
      await user.click(label);
      const input = screen.getByLabelText(/edit timer label/i)
      await user.clear(input);
      await user.keyboard("{Enter}");
      expect(screen.getByText(originalText!)).toBeInTheDocument();
    })
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
        screen.getByRole("button", { name: /add.*timer/i })
      ).toBeInTheDocument();
    });

    it("should add a new timer when Add Timer is clicked", () => {
      render(<App />);

      fireEvent.click(screen.getByRole("button", { name: /add.*timer/i }));

      const timers = screen.getAllByText("00:02:00");
      expect(timers).toHaveLength(2);
    });

    it("should show delete button only when multiple timers exist", () => {
      render(<App />);

      expect(screen.queryByTitle("Remove timer")).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: /add.*timer/i }));

      const deleteButtons = screen.getAllByTitle("Remove timer");
      expect(deleteButtons.length).toBeGreaterThan(0);
    });

    it("should remove a timer when delete is clicked", () => {
      render(<App />);

      fireEvent.click(screen.getByRole("button", { name: /add.*timer/i }));
      expect(screen.getAllByText("00:02:00")).toHaveLength(2);

      fireEvent.click(screen.getAllByTitle("Remove timer")[0]);
      expect(screen.getAllByText("00:02:00")).toHaveLength(1);
    });

    it("should run multiple timers independently", () => {
      vi.useFakeTimers();

      render(<App />);

      fireEvent.click(screen.getByRole("button", { name: /add.*timer/i }));

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

      await user.click(screen.getByRole("button", { name: /add.*timer/i }));

      const editButtons = screen.getAllByRole("button", { name: /edit button/i });
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

  describe("Inline Edit", () => {
    it("should show inline inputs when clicking time display in idle state", async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(
        screen.getByRole("button", { name: /click to edit time/i })
      );

      expect(screen.getByLabelText(/edit hours/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/edit minutes/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/edit seconds/i)).toBeInTheDocument();
    });

    it("should not show inline inputs when timer is running", () => {
      render(<App />);

      fireEvent.click(screen.getByRole("button", { name: /start/i }));

      expect(
        screen.queryByRole("button", { name: /click to edit time/i })
      ).not.toBeInTheDocument();
    });

    it("should save new value on Enter", async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(
        screen.getByRole("button", { name: /click to edit time/i })
      );

      const minutesInput = screen.getByLabelText(/edit minutes/i);
      await user.clear(minutesInput);
      await user.type(minutesInput, "5");
      await user.keyboard("{Enter}");

      expect(screen.getByText("00:05:00")).toBeInTheDocument();
    });

    it("should revert on Escape", async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(
        screen.getByRole("button", { name: /click to edit time/i })
      );

      const minutesInput = screen.getByLabelText(/edit minutes/i);
      await user.clear(minutesInput);
      await user.type(minutesInput, "99");
      await user.keyboard("{Escape}");

      expect(screen.getByText("00:02:00")).toBeInTheDocument();
    });

    it("should save on blur (clicking outside)", async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(
        screen.getByRole("button", { name: /click to edit time/i })
      );

      const minutesInput = screen.getByLabelText(/edit minutes/i);
      await user.clear(minutesInput);
      await user.type(minutesInput, "10");

      await user.click(document.body);

      expect(screen.getByText("00:10:00")).toBeInTheDocument();
    });

    it("should only accept numeric values", async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(
        screen.getByRole("button", { name: /click to edit time/i })
      );

      const minutesInput = screen.getByLabelText(/edit minutes/i);
      await user.clear(minutesInput);
      await user.type(minutesInput, "abc");

      expect(minutesInput).toHaveValue("");
    });

    it("should revert if all fields are zero", async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(
        screen.getByRole("button", { name: /click to edit time/i })
      );

      const hoursInput = screen.getByLabelText(/edit hours/i);
      const minutesInput = screen.getByLabelText(/edit minutes/i);
      const secondsInput = screen.getByLabelText(/edit seconds/i);
      await user.clear(hoursInput);
      await user.clear(minutesInput);
      await user.clear(secondsInput);
      await user.keyboard("{Enter}");

      expect(screen.getByText("00:02:00")).toBeInTheDocument();
    });

    it("should not be editable when timer is paused", () => {
      vi.useFakeTimers();
      render(<App />);

      fireEvent.click(screen.getByRole("button", { name: /start/i }));
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      fireEvent.click(screen.getByRole("button", { name: /pause/i }));

      expect(
        screen.queryByRole("button", { name: /click to edit time/i })
      ).not.toBeInTheDocument();

      vi.useRealTimers();
    });
  });

  describe("Space Keyboard Shortcut", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should start an idle timer when Space is pressed", () => {
      render(<App />);

      fireEvent.keyDown(window, { code: "Space" });

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(screen.getByText("00:01:59")).toBeInTheDocument();
    });

    it("should pause a running timer when Space is pressed", () => {
      render(<App />);

      fireEvent.keyDown(window, { code: "Space" });

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      fireEvent.keyDown(window, { code: "Space" });

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(screen.getByText("00:01:57")).toBeInTheDocument();
    });

    it("should resume a paused timer when Space is pressed", () => {
      render(<App />);

      fireEvent.keyDown(window, { code: "Space" });
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      fireEvent.keyDown(window, { code: "Space" });

      fireEvent.keyDown(window, { code: "Space" });
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(screen.getByText("00:01:55")).toBeInTheDocument();
    });

    it("should not trigger when an input field is focused", async () => {
      render(<App />);

      fireEvent.click(screen.getByRole("button", { name: /edit button/i }));

      const minutesInput = screen.getByLabelText(/minutes/i);
      fireEvent.keyDown(minutesInput, { code: "Space" });

      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText("00:02:00")).toBeInTheDocument();
    });
  });

  describe("Persistence", () => {
    it("should save timers to localStorage when state changes", () => {
      render(<App />);
      fireEvent.click(screen.getByRole("button", { name: /add new timer/i }));

      const raw = localStorage.getItem("timer-app:timers");
      expect(raw).not.toBeNull();
      const saved = JSON.parse(raw!);
      expect(saved).toHaveLength(2);
    });

    it("should restore timers from localStorage on load", () => {
      localStorage.setItem(
        "timer-app:timers",
        JSON.stringify([
          {
            id: "1",
            label: "Timer 1",
            timeLeft: 600,
            initialTime: 600,
            status: "idle",
            sessions: 3,
          },
        ])
      );

      render(<App />);
      expect(screen.getByText("00:10:00")).toBeInTheDocument();
      expect(screen.getByText("3")).toBeInTheDocument();
    });

    it("should fall back to a default timer when localStorage is corrupted", () => {
      localStorage.setItem("timer-app:timers", "not json{");
      render(<App />);
      expect(screen.getByText("00:02:00")).toBeInTheDocument();
    });

    it("should reset a running timer to idle on reload", () => {
      localStorage.setItem(
        "timer-app:timers",
        JSON.stringify([
          {
            id: "1",
            label: "Timer 1",
            timeLeft: 30,
            initialTime: 120,
            status: "running",
            sessions: 0,
          },
        ])
      );

      render(<App />);
      expect(screen.getByText("00:02:00")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /start/i })
      ).toBeInTheDocument();
    });
  });
});
