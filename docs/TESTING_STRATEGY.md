# Testing Strategy

This document defines how tests are organized, written, and maintained in this project.

## Testing Tools

| Tool | Purpose |
|------|---------|
| [Vitest](https://vitest.dev/) | Unit and integration test runner |
| [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) | Render and interact with React components in tests |
| [jsdom](https://github.com/jsdom/jsdom) | Simulates a browser environment for tests |

## Testing Pyramid

Tests are organized in layers. Write more tests at the bottom (fast, cheap) and fewer at the top (slow, expensive).

```
         /  E2E  \          ← fewest — full browser, real clicks
        / Integration \     ← test full features via App component
       /  Component    \    ← test components in isolation with mock props
      /  Hook tests     \   ← test custom hooks with renderHook()
     /  Utility tests    \  ← most — pure input/output, no React needed
```

## Folder Structure

Tests live next to the code they test. Each test file mirrors its source file name with `.test.` added.

```
src/
├── utils/
│   ├── timerUtils.ts
│   └── timerUtils.test.ts         ← utility tests
├── hooks/
│   ├── useTimers.ts
│   └── useTimers.test.ts          ← hook tests
├── TimerCard.tsx
├── TimerCard.test.tsx             ← component test
├── EditTimer.tsx
├── EditTimer.test.tsx             ← component test
├── PipTimer.tsx
├── PipTimer.test.tsx              ← component test
├── App.tsx
└── App.test.tsx                   ← integration tests (already exists)
```

## What to Test at Each Layer

### 1. Utility Functions (`utils/*.test.ts`)

These are the easiest tests to write. Pure functions — no React, no DOM, no mocking.

**What to test:**
- Does the function return the correct output for a given input?
- Does it handle edge cases? (zero, negative, boundary values, empty strings)
- Does it handle invalid input gracefully?

**Pattern:**
```typescript
import { describe, it, expect } from "vitest";
import { formatTime } from "./timerUtils";

describe("formatTime", () => {
  it("formats zero seconds", () => {
    expect(formatTime(0)).toBe("00:00:00");
  });

  it("formats hours, minutes, and seconds", () => {
    expect(formatTime(3661)).toBe("01:01:01");
  });
});
```

### 2. Custom Hooks (`hooks/*.test.ts`)

Test state management and side effects using `renderHook()`.

**What to test:**
- Does the hook initialize with correct default values?
- Do actions (start, pause, stop, etc.) change state correctly?
- Do state transitions follow the expected flow? (idle → running → paused → idle)

**Pattern:**
```typescript
import { renderHook, act } from "@testing-library/react";
import { useTimers } from "./useTimers";

describe("useTimers", () => {
  it("initializes with one default timer", () => {
    const { result } = renderHook(() => useTimers());
    expect(result.current.timers).toHaveLength(1);
    expect(result.current.timers[0].status).toBe("idle");
  });

  it("starts a timer", () => {
    const { result } = renderHook(() => useTimers());
    act(() => {
      result.current.handleStart(result.current.timers[0].id);
    });
    expect(result.current.timers[0].status).toBe("running");
  });
});
```

### 3. Components (`*.test.tsx`)

Test components in isolation by passing mock props and asserting what renders.

**What to test:**
- Does it render the right content for given props?
- Do the correct buttons/elements appear based on state?
- Do callbacks fire when buttons are clicked?
- Are conditional elements shown/hidden correctly?

**Pattern:**
```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TimerCard from "./TimerCard";

const mockTimer = {
  id: "1",
  timeLeft: 300,
  initialTime: 300,
  status: "idle" as const,
  sessions: 0,
};

const noop = () => {};

describe("TimerCard", () => {
  it("shows Start button when idle", () => {
    render(
      <TimerCard
        timer={mockTimer}
        onStart={noop}
        onPause={noop}
        onResume={noop}
        onStop={noop}
        onReset={noop}
        onEdit={noop}
        onDelete={noop}
        canDelete={false}
      />
    );
    expect(screen.getByText("Start")).toBeInTheDocument();
  });

  it("calls onStart when Start is clicked", async () => {
    const onStart = vi.fn();
    render(
      <TimerCard
        timer={mockTimer}
        onStart={onStart}
        onPause={noop}
        onResume={noop}
        onStop={noop}
        onReset={noop}
        onEdit={noop}
        onDelete={noop}
        canDelete={false}
      />
    );
    await userEvent.click(screen.getByText("Start"));
    expect(onStart).toHaveBeenCalledWith("1");
  });
});
```

### 4. Integration Tests (`App.test.tsx`)

Test full user flows through the `App` component. These already exist in the project.

**What to test:**
- Complete user journeys (create timer → set time → start → pause → stop)
- Feature interactions (multiple timers, editing, deleting)
- Edge cases in the full flow (timer completion, session counting)

## Testing Conventions

### Naming

- Test files: `ComponentName.test.tsx` or `utilName.test.ts`
- Describe blocks: name of the function or component
- Test names: describe what behavior is being verified, not how

```typescript
// Good — describes behavior
it("disables Start button when timeLeft is 0")
it("returns purple when status is idle")

// Bad — describes implementation
it("calls setState with running")
it("checks the if branch for idle")
```

### Mock Callbacks

Use `vi.fn()` to create mock functions for component callbacks:

```typescript
const onStart = vi.fn();
// ... render component with onStart ...
// ... trigger the action ...
expect(onStart).toHaveBeenCalledWith("timer-id");
expect(onStart).toHaveBeenCalledTimes(1);
```

### Querying Elements

Use queries in this priority order (most accessible → least):

1. `getByRole` — buttons, links, inputs by their ARIA role
2. `getByLabelText` — form inputs by their label
3. `getByText` — elements by visible text
4. `getByTestId` — last resort, use `data-testid` attribute

```tsx
// Preferred
screen.getByRole("button", { name: "Start" });
screen.getByLabelText("Hours");

// Acceptable
screen.getByText("00:05:00");

// Last resort
screen.getByTestId("progress-ring");
```

### Using `data-testid`

When you can't query by role, label, or text, add a `data-testid` attribute:

```tsx
// In the component
<svg data-testid="progress-ring">...</svg>

// In the test
screen.getByTestId("progress-ring");
```

Rules for `data-testid`:
- Use static, descriptive names: `data-testid="delete-button"`
- Never use dynamic values: ~~`data-testid={`timer-${index}`}~~`
- Only use when no accessible query works

## Running Tests

```bash
# Run all tests in watch mode (re-runs on file changes)
pnpm test

# Run all tests once (CI mode)
pnpm test -- --run

# Run a specific test file
pnpm test -- src/TimerCard.test.tsx

# Run tests matching a pattern
pnpm test -- --grep "formatTime"
```

## Before Submitting a PR

Every PR must pass these checks:

```bash
pnpm lint        # No lint errors
pnpm build       # TypeScript compiles
pnpm test        # All tests pass
```

If any command fails, fix the issue before pushing. Do not skip tests.
