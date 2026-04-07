import { describe, it, expect, } from "vitest";
import App from "./App";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe("Edit Timer", () => {
  it("should display an Edit button", () => {
    render(<App />);
    expect(screen.getByRole("button", { name: /^edit$/i })).toBeInTheDocument();
  });

  it("should open a popup when Edit button is clicked", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /^edit$/i }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("should pre-fill fields with current timer value", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /^edit$/i }));

    expect(screen.getByLabelText(/hours/i)).toHaveValue("0");
    expect(screen.getByLabelText(/minutes/i)).toHaveValue("2");
    expect(screen.getByLabelText(/seconds/i)).toHaveValue("0");
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

    expect(
      screen.getByText("Minutes and seconds cannot be more than 59")
    ).toBeInTheDocument();
  });

  it("should show error when minutes exceed 59", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /^edit$/i }));

    const minutesInput = screen.getByLabelText(/minutes/i);
    await user.clear(minutesInput);
    await user.type(minutesInput, "75");

    expect(
      screen.getByText("Minutes and seconds cannot be more than 59")
    ).toBeInTheDocument();
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

    await user.clear(screen.getByLabelText(/hours/i));
    await user.clear(screen.getByLabelText(/minutes/i));
    await user.clear(screen.getByLabelText(/seconds/i));

    expect(
      screen.getByText("Enter a value in at least one field")
    ).toBeInTheDocument();
  });

  it("should not save when all fields are zero", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /^edit$/i }));

    await user.clear(screen.getByLabelText(/hours/i));
    await user.clear(screen.getByLabelText(/minutes/i));
    await user.clear(screen.getByLabelText(/seconds/i));

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

    expect(
      screen.getByText("Hours cannot be more than 99")
    ).toBeInTheDocument();
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

    expect(
      screen.getByText("Hours cannot be more than 99")
    ).toBeInTheDocument();

    await user.clear(hoursInput);
    await user.type(hoursInput, "50");

    expect(
      screen.queryByText("Hours cannot be more than 99")
    ).not.toBeInTheDocument();
  });

  it("should clear error when value is corrected to 59 or below", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /^edit$/i }));

    const minutesInput = screen.getByLabelText(/minutes/i);
    await user.clear(minutesInput);
    await user.type(minutesInput, "75");

    expect(
      screen.getByText("Minutes and seconds cannot be more than 59")
    ).toBeInTheDocument();

    await user.clear(minutesInput);
    await user.type(minutesInput, "30");

    expect(
      screen.queryByText("Minutes and seconds cannot be more than 59")
    ).not.toBeInTheDocument();
  });
});
