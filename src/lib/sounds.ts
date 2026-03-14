/** Lightweight sound effect system using Web Audio API tone synthesis */

type SoundName = 'countdown-tick' | 'countdown-urgent' | 'vote-submit' | 'scenario-start' | 'scenario-end' | 'game-end' | 'award' | 'join-room' | 'player-joined' | 'phase-transition' | 'button-click' | 'reveal' | 'whoosh'

let audioCtx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext()
  return audioCtx
}

function playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.15) {
  try {
    const ctx = getCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, ctx.currentTime)
    gain.gain.setValueAtTime(volume, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + duration)
  } catch { /* ignore audio errors */ }
}

function playChord(freqs: number[], duration: number, type: OscillatorType = 'sine', volume = 0.1) {
  freqs.forEach((f) => playTone(f, duration, type, volume))
}

function playNoise(duration: number, volume = 0.05) {
  try {
    const ctx = getCtx()
    const bufferSize = ctx.sampleRate * duration
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.5
    const source = ctx.createBufferSource()
    const gain = ctx.createGain()
    const filter = ctx.createBiquadFilter()
    filter.type = 'highpass'
    filter.frequency.setValueAtTime(3000, ctx.currentTime)
    source.buffer = buffer
    gain.gain.setValueAtTime(volume, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
    source.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)
    source.start()
    source.stop(ctx.currentTime + duration)
  } catch { /* ignore */ }
}

const SOUNDS: Record<SoundName, () => void> = {
  'countdown-tick': () => playTone(880, 0.08, 'sine', 0.08),
  'countdown-urgent': () => playTone(1200, 0.15, 'square', 0.12),
  'vote-submit': () => {
    playTone(523, 0.1, 'sine', 0.12)
    setTimeout(() => playTone(659, 0.12, 'sine', 0.12), 80)
  },
  'scenario-start': () => {
    playChord([523, 659, 784], 0.4, 'sine', 0.1)
  },
  'scenario-end': () => {
    playTone(784, 0.15, 'sine', 0.12)
    setTimeout(() => playTone(659, 0.15, 'sine', 0.12), 120)
    setTimeout(() => playTone(523, 0.3, 'sine', 0.12), 240)
  },
  'game-end': () => {
    playChord([523, 659, 784], 0.3, 'sine', 0.1)
    setTimeout(() => playChord([587, 740, 880], 0.5, 'sine', 0.12), 300)
  },
  'award': () => {
    // Triumphant ascending arpeggio
    playTone(523, 0.15, 'sine', 0.1)
    setTimeout(() => playTone(659, 0.15, 'sine', 0.1), 100)
    setTimeout(() => playTone(784, 0.15, 'sine', 0.12), 200)
    setTimeout(() => playChord([1047, 784, 659], 0.6, 'sine', 0.1), 350)
  },
  'join-room': () => {
    playTone(440, 0.1, 'sine', 0.08)
    setTimeout(() => playTone(554, 0.15, 'sine', 0.1), 80)
  },
  'player-joined': () => {
    playTone(660, 0.08, 'sine', 0.06)
    setTimeout(() => playTone(784, 0.1, 'sine', 0.06), 60)
  },
  'phase-transition': () => {
    playNoise(0.15, 0.04)
    playTone(440, 0.2, 'sine', 0.08)
    setTimeout(() => playTone(554, 0.25, 'sine', 0.08), 100)
  },
  'button-click': () => {
    playTone(800, 0.05, 'sine', 0.06)
  },
  'reveal': () => {
    // Mystical reveal — rising chord with shimmer
    playNoise(0.3, 0.03)
    playTone(330, 0.3, 'sine', 0.08)
    setTimeout(() => playTone(440, 0.3, 'sine', 0.08), 150)
    setTimeout(() => playChord([554, 660, 880], 0.5, 'sine', 0.08), 300)
  },
  'whoosh': () => {
    playNoise(0.2, 0.06)
    playTone(200, 0.15, 'sine', 0.05)
  },
}

export function playSound(name: SoundName) {
  SOUNDS[name]?.()
}
