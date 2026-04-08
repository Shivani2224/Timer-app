import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PipTimer from "./PipTimer";

const defaultProps = {
  display: "00:02:00",
  progress: 0.5,
  ringColor: "#7c5cff",
  status: "running" as const,
  onPause: vi.fn(),
  onResume: vi.fn(),
  onStop: vi.fn(),
};

describe("PipTimer", () => {
    it("Should display the timer value", () => {
        render(<PipTimer {...defaultProps} />);
        expect(screen.getByText("00:02:00")).toBeInTheDocument();
    });

    it("should show pause and stop buttons when running", () => {
        render(<PipTimer {...defaultProps} status="running" />);
        expect(screen.getByRole("button", { name: /pause/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /stop/i })).toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: /resume/i })
        ).not.toBeInTheDocument();
    });

    it("should show Resume and stop buttons when paused", () => {
        render(<PipTimer {...defaultProps} status="paused" />);
        expect(screen.getByRole("button", { name: /resume/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /stop/i })).toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: /pause/i })
        ).not.toBeInTheDocument();
    });
    it("should call onStop when stop is clicked", async () => {
        const onStop = vi.fn();
        const user = userEvent.setup();
        render(<PipTimer {...defaultProps} onStop={onStop} />);
        await user.click(screen.getByRole("button", { name: /stop/i }));
        expect(onStop).toHaveBeenCalledOnce();
    });

    it("should not render progress ring when progress is 0", () => {
        const { container } = render(<PipTimer {...defaultProps} progress={0} />);
        const circles = container.querySelectorAll("circle");
        expect(circles).toHaveLength(1);
    });

    it("should render progress ring when progress is greater than 0", () => {
        const { container } = render(<PipTimer {...defaultProps} progress={0.5} />);
        const circles = container.querySelectorAll("circle");
        expect(circles).toHaveLength(2);
    });
});