# Timer App

A modern, feature-rich focus timer built with React, TypeScript, and Vite. Supports multiple independent timers, Picture-in-Picture mode, and a sleek glass-morphism UI.

## Features

- **Start / Pause / Resume / Stop / Reset** — full timer lifecycle controls
- **Multiple Timers** — add unlimited independent timers running simultaneously
- **Edit Duration** — set custom hours, minutes, and seconds
- **Picture-in-Picture** — floating timer window that stays on top
- **Circular Progress Ring** — visual countdown with color changes (purple → yellow → red)
- **Sound Alert** — audio notification when timer completes
- **Session Tracking** — tracks total completed sessions
- **Keyboard Shortcut** — Space to start/pause
- **Responsive Design** — works on mobile, tablet, and desktop

## Tech Stack

- **React 19** — UI framework
- **TypeScript** — type safety
- **Vite 7** — build tool
- **Tailwind CSS 4** — styling
- **Vitest** + **React Testing Library** — testing

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm

### Installation

```bash
git clone https://github.com/Shivani2224/Timer-app.git
cd Timer-app
npm install
```

### Run the App

```bash
npm run dev
```

Opens at `http://localhost:5173`

### Other Commands

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run test` | Run test suite |
| `npm run lint` | Lint code with ESLint |

## Project Structure

```
src/
├── App.tsx          # Main state management and timer logic
├── TimerCard.tsx    # Timer display with progress ring and controls
├── EditTimer.tsx    # Modal for editing timer duration
├── PipTimer.tsx     # Picture-in-Picture timer widget
├── App.test.tsx     # Test suite (40+ test cases)
├── index.css        # Tailwind config and custom animations
└── main.tsx         # React entry point
```

## Git Workflow

All contributors must follow the git workflow defined in [GIT_FLOW.md](GIT_FLOW.md).


