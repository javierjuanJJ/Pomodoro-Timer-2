/**
 * localStorage persistence with a versioned schema.
 *
 * Stored shape: `{ v: 1, settings, completedPomodoros }`. Only preferences and
 * the session counter survive a reload — a reloaded tab always restarts idle
 * (an expired `endsAt` from a previous visit would be meaningless).
 *
 * Nothing read from storage is trusted: every field is type-checked and merged
 * over the defaults. Callers must invoke `loadPersistedData()` from a lazy
 * `useState` initializer or effect — never during render.
 */

import {
  DEFAULT_SETTINGS,
  sanitizeSettings,
  type Settings,
} from '../features/timer/timerReducer'

const STORAGE_KEY = 'pomodoro-timer'
const SCHEMA_VERSION = 1

export interface PersistedData {
  v: number
  settings: Settings
  completedPomodoros: number
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function readCount(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? Math.floor(value)
    : 0
}

/**
 * Validate an untrusted parsed value into `PersistedData`. Unknown schema
 * versions fall back to defaults; migrating old versions later means adding a
 * `case` here that upgrades the stored shape before validation.
 */
function parsePersisted(value: unknown): PersistedData {
  const defaults: PersistedData = {
    v: SCHEMA_VERSION,
    settings: DEFAULT_SETTINGS,
    completedPomodoros: 0,
  }
  if (!isRecord(value) || value['v'] !== SCHEMA_VERSION) return defaults
  return {
    v: SCHEMA_VERSION,
    // Type-check each field individually and merge over the defaults.
    settings: sanitizeSettings(
      isRecord(value['settings']) ? (value['settings'] as Partial<Settings>) : {},
    ),
    completedPomodoros: readCount(value['completedPomodoros']),
  }
}

export function loadPersistedData(): PersistedData {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw === null) return parsePersisted(null)
    return parsePersisted(JSON.parse(raw) satisfies unknown)
  } catch {
    // Corrupt JSON, blocked storage (private mode), or storage disabled:
    // the app keeps working with in-memory defaults.
    return parsePersisted(null)
  }
}

export function savePersistedData(data: PersistedData): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // Storage full or unavailable — persistence is best-effort only.
  }
}
