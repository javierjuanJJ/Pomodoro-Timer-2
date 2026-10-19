# AGENTS.md

Pomodoro Timer web app for learning frontend skills. Vite + React + strict TypeScript + Tailwind v4. Fully client-side (no server, no data fetching).

## Project status

Not yet scaffolded. Bootstrap with:

```bash
npm create vite@latest . -- --template react-ts
npm install
npm install -D tailwindcss @tailwindcss/vite
```

Then verify every command below against the generated `package.json` and fix this file if anything differs.

## Commands

Standard Vite scripts (confirm after scaffold):

- `npm run dev` — dev server
- `npm run build` — typecheck (`tsc -b`) + production build
- `npm run preview` — serve the production build locally
- `npm run lint` — ESLint
- `npm run typecheck` — `tsc -b --noEmit` (add this script if missing)

Order before considering any change done: `lint` → `typecheck` → `build`.

## Architecture

- `src/features/timer/timerReducer.ts` is a **pure finite state machine** (no React imports). It owns: phase (`work | short | long`), status (`idle | running | paused`), `completedPomodoros`, and settings. All transitions happen here; components only render derived values.
- **Timestamp-based timing, never counter decrements.** State stores `endsAt` (ms epoch); remaining time is *derived* on each tick as `endsAt - Date.now()`. Decrementing a counter in an interval drifts or freezes under background-tab throttling.
- Auto-advance is a reducer transition on completion. Long break triggers when `completedPomodoros % 4 === 0` (configurable counts).
- Phase accent color is driven by a `data-phase` attribute on a wrapper element; Tailwind/CSS variables recolor all components from that single attribute.
- `src/lib/persistence.ts` owns localStorage with a versioned schema (`{ v: 1, ... }`); validate and merge with defaults on load, never trust stored shapes.
- Layout: centered single column — phase tabs, circular progress ring around the countdown, controls, session dots. Pomofocus-inspired (work = coral red, short break = green, long break = blue, light background).

## Gotchas

- **Web Audio**: `AudioContext` must be created lazily on the first user gesture (button click), or browsers keep it suspended and the end-of-session chime is silent. No audio assets — generate the beep.
- **Keyboard shortcuts** (Space = start/pause, R = reset, S = skip) must not fire while focus is in an input, `dialog`, or contenteditable.
- Countdown text needs `font-variant-numeric: tabular-nums` so digits don't jitter.
- Don't read localStorage during render — in an initializer/lazy `useState` only.

## Standards (non-negotiable)

- TypeScript `strict` plus `noUncheckedIndexedAccess`, `noUnusedLocals`, `noFallthroughCasesInSwitch`. No `any`.
- Accessibility floor: phase tabs use the full ARIA `tablist/tab/tabpanel` pattern with arrow-key navigation; an `aria-live="polite"` region announces phase changes ("Work session complete — short break started"); settings use a native `<dialog>` (free focus trap + Esc); visible `:focus-visible` outlines; `prefers-reduced-motion` disables the progress-ring animation; timer state is never conveyed by color alone. Verify with axe/Lighthouse plus a manual keyboard pass.
- Performance: no inline component definitions, functional `setState` in event handlers, derived values computed during render (not in effects), early-exit over deep nesting. Ignore `server-*`/`bundle-*`/RSC rules from the Vercel skill — this app is client-only.
- Touch targets ≥ 44px; layout must work at 360px width and 200% zoom.

## Sources of truth

- `.agents/skills/accessibility/` — WCAG 2.2 rules; follow it over ad-hoc a11y judgments.
- `.agents/skills/vercel-react-best-practices/` — React performance rules; apply only the client-relevant subset (`rerender-*`, `js-*`, `advanced-*`).
- `.agents/skills/frontend-design/` — design process and restraint rules. Visual direction is deliberately Pomofocus-like (chosen by the client), so the skill's "avoid templated looks" guidance yields to this brief.
- Feature requirements live in the original exercise brief (start/stop/resume, configurable intervals, phase display, work-session count, end sound, responsive + accessible).
