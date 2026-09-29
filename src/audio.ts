let context: AudioContext | null = null

function audio() {
  context ??= new AudioContext()
  return context
}

function beep(frequency: number, when: number, duration: number, type: OscillatorType, volume: number) {
  const node = audio()
  const osc = node.createOscillator()
  const gain = node.createGain()
  osc.type = type
  osc.frequency.value = frequency
  gain.gain.setValueAtTime(0.0001, when)
  gain.gain.exponentialRampToValueAtTime(volume, when + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, when + duration)
  osc.connect(gain).connect(node.destination)
  osc.start(when)
  osc.stop(when + duration + 0.02)
}

export async function playCue(kind: 'ok' | 'bad' | 'win' | 'coin' | 'level' | 'tick', enabled: boolean) {
  if (!enabled) return
  const node = audio()
  if (node.state === 'suspended') await node.resume()
  const now = node.currentTime
  if (kind === 'tick') {
    beep(220, now, 0.05, 'square', 0.03)
    return
  }
  const notes =
    kind === 'ok'
      ? [523, 784]
      : kind === 'bad'
        ? [196, 146]
        : kind === 'coin'
          ? [880, 1318]
          : kind === 'level'
            ? [392, 523, 659, 784, 1046]
            : [349, 523, 698, 1046]
  const type: OscillatorType = kind === 'bad' ? 'sawtooth' : 'triangle'
  notes.forEach((frequency, index) => beep(frequency, now + index * 0.09, 0.18, type, 0.06))
}

export function vibrate(pattern: number | number[], enabled: boolean) {
  if (!enabled || !navigator.vibrate) return
  navigator.vibrate(pattern)
}
