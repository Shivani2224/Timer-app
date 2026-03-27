# Project Standards

This document defines the coding standards and conventions for this project.

## Tech Stack

| Technology | Purpose |
|------------|---------|
| React 19 | UI framework |
| TypeScript | Type safety |
| Vite | Build tool and dev server |
| Tailwind CSS 4 | Styling |
| Vitest | Testing |
| React Testing Library | Component testing |
| ESLint | Code linting |

## Project Structure

```
Timer-app/
├── docs/                    # Project documentation
│   ├── TESTING_STRATEGY.md  # Testing conventions and patterns
│   └── PROJECT_STANDARDS.md # This file
├── public/                  # Static assets (served as-is)
│   └── alarm.mp3            # Timer completion sound
├── src/                     # Source code
│   ├── utils/               # Pure utility functions
│   │   ├── timerUtils.ts
│   │   └── timerUtils.test.ts
│   ├── hooks/               # Custom React hooks
│   │   ├── useTimers.ts
│   │   └── useTimers.test.ts
│   ├── App.tsx              # Main application component
│   ├── App.test.tsx         # Integration tests
│   ├── TimerCard.tsx        # Timer display component
│   ├── TimerCard.test.tsx
│   ├── EditTimer.tsx        # Edit modal component
│   ├── EditTimer.test.tsx
│   ├── PipTimer.tsx         # Picture-in-Picture component
│   ├── PipTimer.test.tsx
│   ├── main.tsx             # App entry point
│   └── index.css            # Global styles
├── GIT_FLOW.md              # Git workflow
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Code Organization

### Three types of code

| Type | Location | Purpose | Can import from |
|------|----------|---------|-----------------|
| **Utilities** | `src/utils/` | Pure functions with no React dependency | Nothing (standalone) |
| **Hooks** | `src/hooks/` | State management and side effects | Utilities |
| **Components** | `src/*.tsx` | UI rendering | Utilities, Hooks, other Components |

### Why this separation matters

- **Utilities** are the easiest to test — pure input/output, no React needed
- **Hooks** isolate state logic from UI — testable with `renderHook()`
- **Components** only handle rendering — testable with mock props

Each layer only depends on the layers below it. Components use hooks and utils. Hooks use utils. Utils depend on nothing.

## TypeScript Conventions

### Strict Mode

TypeScript strict mode is enabled. This means:
- No implicit `any` types
- Null checks are enforced
- All variables must be typed

### Naming

| What | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `TimerCard`, `EditTimer` |
| Functions | camelCase | `formatTime`, `handleStart` |
| Types/Interfaces | PascalCase | `TimerData`, `TimerStatus` |
| Constants | UPPER_SNAKE_CASE | `DEFAULT_TIME` |
| Files (components) | PascalCase | `TimerCard.tsx` |
| Files (utils/hooks) | camelCase | `timerUtils.ts`, `useTimers.ts` |
| Test files | Match source + `.test` | `TimerCard.test.tsx` |

## Component Guidelines

### Keep components focused

Each component should do one thing. If a component is getting long or handling too many concerns, extract logic into:
- A **utility function** if it's pure computation
- A **custom hook** if it involves state or effects
- A **child component** if it's a distinct piece of UI

### Props over internal state

Prefer passing data through props over managing state internally. This makes components:
- Easier to test (pass mock props)
- Easier to reuse (parent controls behavior)
- Easier to debug (data flows in one direction)

### Callback naming

Props that accept event handlers should be named `onAction`:

```tsx
interface TimerCardProps {
  onStart: (id: string) => void;
  onPause: (id: string) => void;
  onDelete: (id: string) => void;
}
```

## Accessibility (a11y)

Accessibility is not optional. Every UI element must be usable by keyboard and screen readers.

### Rules

1. **Icon-only buttons** must have `aria-label`
2. **Decorative icons** must have `aria-hidden="true"`
3. **Form inputs** must have associated `<label>` elements
4. **Dialogs** must have `aria-label` or `aria-labelledby`
5. **All interactive elements** must be reachable via Tab key
6. **Focus indicators** must be visible

### How to test

- Tab through the entire app using only the keyboard
- Every button, link, and input should be reachable
- Every action should be possible without a mouse
- Use a screen reader to verify announcements (macOS: VoiceOver with Cmd+F5)

## CSS / Tailwind Conventions

### Use semantic class names

Group related classes logically. For long class strings, put the most important classes first:

```
layout → spacing → colors → typography → effects → responsive
```

Example:
```tsx
className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl transition-all hover:scale-105"
```

### Responsive design

Use Tailwind's responsive prefixes. Mobile-first — base styles apply to all screens, then override for larger:

```tsx
className="text-sm sm:text-base lg:text-lg"
//         mobile    tablet     desktop
```

## Scripts

| Command | What it does | When to run |
|---------|-------------|-------------|
| `pnpm dev` | Start dev server on localhost:5173 | During development |
| `pnpm build` | TypeScript check + production build | Before pushing |
| `pnpm lint` | Run ESLint on all files | Before pushing |
| `pnpm test` | Run all tests in watch mode | During development |
| `pnpm preview` | Preview production build locally | After building |

## Before Every PR

Run all three checks. If any fail, fix before pushing:

```bash
pnpm lint        # No lint errors
pnpm build       # TypeScript compiles cleanly
pnpm test        # All tests pass
```

## Further Reading

- [GIT_FLOW.md](../GIT_FLOW.md) — Git branching, commits, and PR workflow
- [TESTING_STRATEGY.md](./TESTING_STRATEGY.md) — Testing patterns and conventions
