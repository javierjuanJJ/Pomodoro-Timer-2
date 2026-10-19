/**
 * Synthesized end-of-session chime — no audio assets.
 *
 * The AudioContext is created lazily from the first user gesture (a button
 * click calls `ensureAudioContext`); browsers keep contexts created outside a
 * gesture suspended, which would make the chime silent.
 */

let audioContext: AudioContext | null = null

export function ensureAudioContext(): void {
  if (audioContext === null) {
    audioContext = new AudioContext()
  }
  if (audioContext.state === 'suspended') {
    void audioContext.resume()
  }
}

/** Two short descending notes; a no-op if audio was never unlocked. */
export function playChime(): void {
  if (audioContext === null || audioContext.state !== 'running') return
  const start = audioContext.currentTime
  playNote(880, start, 0.18)
  playNote(660, start + 0.2, 0.35)
}

function playNote(frequency: number, at: number, duration: number): void {
  if (audioContext === null) return
  const oscillator = audioContext.createOscillator()
  const gain = audioContext.createGain()
  oscillator.type = 'sine'
  oscillator.frequency.value = frequency
  gain.gain.setValueAtTime(0.0001, at)
  gain.gain.exponentialRampToValueAtTime(0.3, at + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, at + duration)
  oscillator.connect(gain).connect(audioContext.destination)
  oscillator.start(at)
  oscillator.stop(at + duration + 0.05)
}
