# Pomodoro-Timer-2

Pomodoro timer web app (Vite + React + strict TypeScript + Tailwind v4), fully client-side.

## Commands

```bash
npm run dev        # dev server
npm run lint       # oxlint
npm run typecheck  # tsc -b --noEmit
npm run build      # typecheck + production build
npm run preview    # serve the production build
```

## Keyboard shortcuts

| Key | Action |
| --- | --- |
| <kbd>Space</kbd> | Start / pause / resume |
| <kbd>R</kbd> | Reset the current session |
| <kbd>S</kbd> | Skip to the next phase |
| <kbd>←</kbd> <kbd>→</kbd> <kbd>Home</kbd> <kbd>End</kbd> | Move between phase tabs |

Shortcuts never fire while typing in a field or while the settings dialog is open.

## Architecture

- `src/features/timer/timerReducer.ts` — pure finite state machine (no React, no
  `Date.now()`); all transitions, including auto-advance, live here.
- `src/features/timer/useTimerEngine.ts` — binds the FSM to React: timestamp
  ticks, localStorage, chime, live-region announcements.
- `src/lib/persistence.ts` — versioned `{ v: 1 }` localStorage schema, validated
  and merged over defaults on load.
- `src/lib/audio.ts` — synthesized end-of-session chime (Web Audio, no assets).

Settings and the completed-session counter persist across reloads.
