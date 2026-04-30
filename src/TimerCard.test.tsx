import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TimerCard, { type TimerData } from "./TimerCard";

function createTimer(overrides: Partial<TimerData> = {}): TimerData {
  return {
    id: "1",
    label: "Timer 1",
    timeLeft: 120,
    initialTime: 120,
    status: "idle",
    sessions: 0,
    ...overrides,
  };
}

function createProps(overrides: Record<string, unknown> = {}) {
  return {
    timer: createTimer(),
    onStart: vi.fn(),
    onPause: vi.fn(),
    onResume: vi.fn(),
    onStop: vi.fn(),
    onReset: vi.fn(),
    onEdit: vi.fn(),
    onInlineEdit: vi.fn(),
    onDelete: vi.fn(),
    onLabelChange: vi.fn(),
    canDelete: false,
    ...overrides,
  };
}

describe("TimerCard", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("time display", () => {
    it("should display formatted time HH:MM:SS", () => {
      render(<TimerCard {...createProps()} />);
      expect(screen.getByText("00:02:00")).toBeInTheDocument();
    });

    it("should display hours when timeLeft >= 3600", () => {
      const props = createProps({
        timer: createTimer({ timeLeft: 3661, initialTime: 3661 }),
      });
      render(<TimerCard {...props} />);
      expect(screen.getByText("01:01:01")).toBeInTheDocument();
    });

    it("should display 00:00:00 when timeLeft is 0", () => {
      const props = createProps({
        timer: createTimer({ timeLeft: 0, initialTime: 120 }),
      });
      render(<TimerCard {...props} />);
      expect(screen.getByText("00:00:00")).toBeInTheDocument();
    });
  });

  describe("session count", () => {
    it("should display sessions count", () => {
      const props = createProps({
        timer: createTimer({ sessions: 5 }),
      });
      render(<TimerCard {...props} />);
      expect(screen.getByText("Sessions:")).toBeInTheDocument();
      expect(screen.getByText("5")).toBeInTheDocument();
    });
  });

  describe("idle status buttons", () => {
    it("should show Start and Edit buttons when idle", () => {
      render(<TimerCard {...createProps()} />);
      expect(screen.getByText("Start")).toBeInTheDocument();
      expect(screen.getByText("Edit")).toBeInTheDocument();
    });

    it("should call onStart with id when Start is clicked", async () => {
      const props = createProps();
      render(<TimerCard {...props} />);
      await userEvent.click(screen.getByText("Start"));
      expect(props.onStart).toHaveBeenCalledWith("1");
    });

    it("should call onEdit with id when Edit is clicked", async () => {
      const props = createProps();
      render(<TimerCard {...props} />);
      await userEvent.click(screen.getByText("Edit"));
      expect(props.onEdit).toHaveBeenCalledWith("1");
    });

    it("should disable Start button when timeLeft is 0", () => {
      const props = createProps({
        timer: createTimer({ timeLeft: 0, initialTime: 120 }),
      });
      render(<TimerCard {...props} />);
      expect(screen.getByText("Start")).toBeDisabled();
    });

    it("should not show Pause, Resume, Stop, or Reset when idle", () => {
      render(<TimerCard {...createProps()} />);
      expect(screen.queryByText("Pause")).not.toBeInTheDocument();
      expect(screen.queryByText("Resume")).not.toBeInTheDocument();
      expect(screen.queryByText("Stop")).not.toBeInTheDocument();
      expect(screen.queryByText("Reset")).not.toBeInTheDocument();
    });
  });

  describe("running status buttons", () => {
    it("should show Pause, Stop, and Reset when running", () => {
      const props = createProps({
        timer: createTimer({ status: "running" }),
      });
      render(<TimerCard {...props} />);
      expect(screen.getByText("Pause")).toBeInTheDocument();
      expect(screen.getByText("Stop")).toBeInTheDocument();
      expect(screen.getByText("Reset")).toBeInTheDocument();
    });

    it("should call onPause with id when Pause is clicked", async () => {
      const props = createProps({
        timer: createTimer({ status: "running" }),
      });
      render(<TimerCard {...props} />);
      await userEvent.click(screen.getByText("Pause"));
      expect(props.onPause).toHaveBeenCalledWith("1");
    });

    it("should call onStop with id when Stop is clicked", async () => {
      const props = createProps({
        timer: createTimer({ status: "running" }),
      });
      render(<TimerCard {...props} />);
      await userEvent.click(screen.getByText("Stop"));
      expect(props.onStop).toHaveBeenCalledWith("1");
    });

    it("should call onReset with id when Reset is clicked", async () => {
      const props = createProps({
        timer: createTimer({ status: "running" }),
      });
      render(<TimerCard {...props} />);
      await userEvent.click(screen.getByText("Reset"));
      expect(props.onReset).toHaveBeenCalledWith("1");
    });

    it("should not show Start or Edit when running", () => {
      const props = createProps({
        timer: createTimer({ status: "running" }),
      });
      render(<TimerCard {...props} />);
      expect(screen.queryByText("Start")).not.toBeInTheDocument();
      expect(screen.queryByText("Edit")).not.toBeInTheDocument();
    });
  });

  describe("paused status buttons", () => {
    it("should show Resume, Stop, and Reset when paused", () => {
      const props = createProps({
        timer: createTimer({ status: "paused" }),
      });
      render(<TimerCard {...props} />);
      expect(screen.getByText("Resume")).toBeInTheDocument();
      expect(screen.getByText("Stop")).toBeInTheDocument();
      expect(screen.getByText("Reset")).toBeInTheDocument();
    });

    it("should call onResume with id when Resume is clicked", async () => {
      const props = createProps({
        timer: createTimer({ status: "paused" }),
      });
      render(<TimerCard {...props} />);
      await userEvent.click(screen.getByText("Resume"));
      expect(props.onResume).toHaveBeenCalledWith("1");
    });
  });

  describe("delete button", () => {
    it("should not show delete button when canDelete is false", () => {
      render(<TimerCard {...createProps()} />);
      expect(screen.queryByTitle("Remove timer")).not.toBeInTheDocument();
    });

    it("should show delete button when canDelete is true", () => {
      const props = createProps({ canDelete: true });
      render(<TimerCard {...props} />);
      expect(screen.getByTitle("Remove timer")).toBeInTheDocument();
    });

    it("should call onDelete with id when delete is clicked", async () => {
      const props = createProps({ canDelete: true });
      render(<TimerCard {...props} />);
      await userEvent.click(screen.getByTitle("Remove timer"));
      expect(props.onDelete).toHaveBeenCalledWith("1");
    });
  });

  describe("inline time editing", () => {
    it("should enter edit mode when time display is clicked in idle state", async () => {
      render(<TimerCard {...createProps()} />);
      await userEvent.click(screen.getByLabelText("Click to edit time"));
      expect(screen.getByLabelText("edit hours")).toBeInTheDocument();
      expect(screen.getByLabelText("edit minutes")).toBeInTheDocument();
      expect(screen.getByLabelText("edit seconds")).toBeInTheDocument();
    });

    it("should not enter edit mode when time display is clicked in running state", async () => {
      const props = createProps({
        timer: createTimer({ status: "running" }),
      });
      render(<TimerCard {...props} />);
      expect(screen.queryByLabelText("Click to edit time")).not.toBeInTheDocument();
    });

    it("should pre-fill inputs with current time values", async () => {
      render(<TimerCard {...createProps()} />);
      await userEvent.click(screen.getByLabelText("Click to edit time"));
      expect(screen.getByLabelText("edit hours")).toHaveValue("00");
      expect(screen.getByLabelText("edit minutes")).toHaveValue("02");
      expect(screen.getByLabelText("edit seconds")).toHaveValue("00");
    });

    it("should call onInlineEdit on Enter key", async () => {
      const props = createProps();
      render(<TimerCard {...props} />);
      await userEvent.click(screen.getByLabelText("Click to edit time"));
      const minutesInput = screen.getByLabelText("edit minutes");
      await userEvent.clear(minutesInput);
      await userEvent.type(minutesInput, "5");
      await userEvent.keyboard("{Enter}");
      expect(props.onInlineEdit).toHaveBeenCalledWith("1", 300);
    });
    it("should wrap minutes from 59 to 00 on ArrowUp", async () => {
      const props = createProps();
      render(<TimerCard {...props} />);
      await userEvent.click(screen.getByLabelText("Click to edit time"));
      const minutesInput = screen.getByLabelText("edit minutes");
      await userEvent.clear(minutesInput);
      await userEvent.type(minutesInput, "59");
      await userEvent.keyboard("{ArrowUp}");
      expect(minutesInput).toHaveValue("00");
    });
    it("should wrap minutes from 00 to 59 on ArrowDown", async () => {
      const props = createProps();
      render(<TimerCard {...props} />);
      await userEvent.click(screen.getByLabelText("Click to edit time"));
      const minutesInput = screen.getByLabelText("edit minutes");
      await userEvent.clear(minutesInput);
      await userEvent.type(minutesInput, "00");
      await userEvent.keyboard("{ArrowDown}");
      expect(minutesInput).toHaveValue("59");
    });
    it("should wrap hours from 168 to 00 on ArrowUp", async () => {
      const props = createProps();
      render(<TimerCard {...props} />);
      await userEvent.click(screen.getByLabelText("Click to edit time"));
      const hoursInput = screen.getByLabelText("edit hours");
      await userEvent.clear(hoursInput);
      await userEvent.type(hoursInput, "168");
      await userEvent.keyboard("{ArrowUp}");
      expect(hoursInput).toHaveValue("00");
    });
    it("should wrap hours from 00 to 168 on ArrowDown", async () => {
      const props = createProps();
      render(<TimerCard {...props} />);
      await userEvent.click(screen.getByLabelText("Click to edit time"));
      const hoursInput = screen.getByLabelText("edit hours");
      await userEvent.clear(hoursInput);
      await userEvent.type(hoursInput, "00");
      await userEvent.keyboard("{ArrowDown}");
      expect(hoursInput).toHaveValue("168");
    });
    

    it("should cancel edit on Escape key", async () => {
      const props = createProps();
      render(<TimerCard {...props} />);
      await userEvent.click(screen.getByLabelText("Click to edit time"));
      await userEvent.keyboard("{Escape}");
      expect(screen.queryByLabelText("edit hours")).not.toBeInTheDocument();
      expect(props.onInlineEdit).not.toHaveBeenCalled();
    });

    it("should cancel edit when total is 0", async () => {
      const props = createProps();
      render(<TimerCard {...props} />);
      await userEvent.click(screen.getByLabelText("Click to edit time"));
      const hoursInput = screen.getByLabelText("edit hours");
      const minutesInput = screen.getByLabelText("edit minutes");
      const secondsInput = screen.getByLabelText("edit seconds");
      await userEvent.clear(hoursInput);
      await userEvent.type(hoursInput, "0");
      await userEvent.clear(minutesInput);
      await userEvent.type(minutesInput, "0");
      await userEvent.clear(secondsInput);
      await userEvent.type(secondsInput, "0");
      await userEvent.keyboard("{Enter}");
      expect(props.onInlineEdit).not.toHaveBeenCalled();
    });

    it("should cancel edit when values exceed limits (minutes > 59)", async () => {
      const props = createProps();
      render(<TimerCard {...props} />);
      await userEvent.click(screen.getByLabelText("Click to edit time"));
      const minutesInput = screen.getByLabelText("edit minutes");
      await userEvent.clear(minutesInput);
      await userEvent.type(minutesInput, "60");
      await userEvent.keyboard("{Enter}");
      expect(props.onInlineEdit).not.toHaveBeenCalled();
    });

    it("should cancel edit when values exceed limits (seconds > 59)", async () => {
      const props = createProps();
      render(<TimerCard {...props} />);
      await userEvent.click(screen.getByLabelText("Click to edit time"));
      const secondsInput = screen.getByLabelText("edit seconds");
      await userEvent.clear(secondsInput);
      await userEvent.type(secondsInput, "60");
      await userEvent.keyboard("{Enter}");
      expect(props.onInlineEdit).not.toHaveBeenCalled();
    });

    it("should filter non-numeric characters from inputs", async () => {
      render(<TimerCard {...createProps()} />);
      await userEvent.click(screen.getByLabelText("Click to edit time"));
      const minutesInput = screen.getByLabelText("edit minutes");
      await userEvent.clear(minutesInput);
      await userEvent.type(minutesInput, "a3b5c");
      expect(minutesInput).toHaveValue("35");
    });

    it("should save edit when clicking outside", async () => {
      const props = createProps();
      render(
        <div>
          <div data-testid="outside">outside</div>
          <TimerCard {...props} />
        </div>
      );
      await userEvent.click(screen.getByLabelText("Click to edit time"));
      fireEvent.mouseDown(screen.getByTestId("outside"));
      expect(props.onInlineEdit).toHaveBeenCalledWith("1", 120);
    });
  });

  describe("label editing", () => {
    it("should display the timer label", () => {
      render(<TimerCard {...createProps()} />);
      expect(screen.getByText("Timer 1")).toBeInTheDocument();
    });

    it("should enter label edit mode on click", async () => {
      render(<TimerCard {...createProps()} />);
      await userEvent.click(screen.getByLabelText("Click to edit label"));
      expect(screen.getByLabelText("edit timer label")).toBeInTheDocument();
    });

    it("should pre-fill label input with current label", async () => {
      render(<TimerCard {...createProps()} />);
      await userEvent.click(screen.getByLabelText("Click to edit label"));
      expect(screen.getByLabelText("edit timer label")).toHaveValue("Timer 1");
    });

    it("should call onLabelChange on Enter", async () => {
      const props = createProps();
      render(<TimerCard {...props} />);
      await userEvent.click(screen.getByLabelText("Click to edit label"));
      const input = screen.getByLabelText("edit timer label");
      await userEvent.clear(input);
      await userEvent.type(input, "Focus{Enter}");
      expect(props.onLabelChange).toHaveBeenCalledWith("1", "Focus");
    });

    it("should cancel label edit on Escape", async () => {
      const props = createProps();
      render(<TimerCard {...props} />);
      await userEvent.click(screen.getByLabelText("Click to edit label"));
      await userEvent.keyboard("{Escape}");
      expect(screen.queryByLabelText("edit timer label")).not.toBeInTheDocument();
      expect(props.onLabelChange).not.toHaveBeenCalled();
    });

    it("should save label on blur", async () => {
      const props = createProps();
      render(<TimerCard {...props} />);
      await userEvent.click(screen.getByLabelText("Click to edit label"));
      const input = screen.getByLabelText("edit timer label");
      await userEvent.clear(input);
      await userEvent.type(input, "New Label");
      fireEvent.blur(input);
      expect(props.onLabelChange).toHaveBeenCalledWith("1", "New Label");
    });

    it("should not call onLabelChange if label is empty or whitespace", async () => {
      const props = createProps();
      render(<TimerCard {...props} />);
      await userEvent.click(screen.getByLabelText("Click to edit label"));
      const input = screen.getByLabelText("edit timer label");
      await userEvent.clear(input);
      await userEvent.type(input, "   {Enter}");
      expect(props.onLabelChange).not.toHaveBeenCalled();
    });

    it("should trim label before saving", async () => {
      const props = createProps();
      render(<TimerCard {...props} />);
      await userEvent.click(screen.getByLabelText("Click to edit label"));
      const input = screen.getByLabelText("edit timer label");
      await userEvent.clear(input);
      await userEvent.type(input, "  Work  {Enter}");
      expect(props.onLabelChange).toHaveBeenCalledWith("1", "Work");
    });
  });

  describe("progress ring", () => {
    it("should use purple ring color when idle", () => {
      const { container } = render(<TimerCard {...createProps()} />);
      const progressCircle = container.querySelectorAll("circle")[1];
      expect(progressCircle).toHaveAttribute("stroke", "#7c5cff");
    });

    it("should use purple ring color when running with timeLeft > 10", () => {
      const props = createProps({
        timer: createTimer({ status: "running", timeLeft: 60 }),
      });
      const { container } = render(<TimerCard {...props} />);
      const progressCircle = container.querySelectorAll("circle")[1];
      expect(progressCircle).toHaveAttribute("stroke", "#7c5cff");
    });

    it("should use yellow ring color when running with timeLeft <= 10", () => {
      const props = createProps({
        timer: createTimer({ status: "running", timeLeft: 10 }),
      });
      const { container } = render(<TimerCard {...props} />);
      const progressCircle = container.querySelectorAll("circle")[1];
      expect(progressCircle).toHaveAttribute("stroke", "#eab308");
    });

    it("should use red ring color when running with timeLeft <= 5", () => {
      const props = createProps({
        timer: createTimer({ status: "running", timeLeft: 5 }),
      });
      const { container } = render(<TimerCard {...props} />);
      const progressCircle = container.querySelectorAll("circle")[1];
      expect(progressCircle).toHaveAttribute("stroke", "#ef4444");
    });
  });
});
