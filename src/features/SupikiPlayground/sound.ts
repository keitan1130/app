import voice1 from '@/assets/supikivoice/voice1.m4a'
import voice2 from '@/assets/supikivoice/voice2.m4a'
import voice3 from '@/assets/supikivoice/voice3.m4a'

const voiceSources = [voice1, voice2, voice3]
const tune = [72, 76, 79, 76, 74, 77, 81, 77, 72, 76, 79, 84, 81, 79, 76, 74]

// Small, original toy-piano loop. No remote audio or autoplay.
export class PlaygroundSound {
  private context: AudioContext | null = null
  private voices = new Set<HTMLAudioElement>()
  private voiceIndex = 0
  private lastVoice = 0
  private nextBeat = 0
  private beat = 0
  private muted = false
  private music = false
  private disposed = false

  unlock() {
    if (this.disposed || this.muted) return
    try {
      this.context ??= new AudioContext()
      if (this.context.state === 'suspended') void this.context.resume().catch(() => {})
    } catch {
      // The playground also works on devices without Web Audio.
    }
  }

  setMuted(muted: boolean) {
    this.muted = muted
    if (muted) {
      this.stopVoices()
      void this.context?.suspend().catch(() => {})
    } else if (this.context) {
      this.unlock()
    }
  }

  setMusic(active: boolean) {
    this.music = active
    this.nextBeat = 0
    this.beat = 0
  }

  voice(rate = 1, force = false) {
    if (this.disposed || this.muted) return
    const now = performance.now()
    if (!force && now - this.lastVoice < 420) return
    if (this.voices.size >= 3) {
      if (!force) return
      const oldest = this.voices.values().next().value
      if (oldest) {
        oldest.pause()
        oldest.removeAttribute('src')
        oldest.onended = null
        this.voices.delete(oldest)
      }
    }
    this.lastVoice = now
    const audio = new Audio(voiceSources[this.voiceIndex++ % voiceSources.length])
    audio.volume = 0.28
    audio.playbackRate = Math.min(1.35, Math.max(0.8, rate))
    this.voices.add(audio)
    audio.onended = () => this.voices.delete(audio)
    void audio.play().catch(() => this.voices.delete(audio))
  }

  note(midi: number, duration = 0.18, volume = 0.06, type: OscillatorType = 'sine') {
    const context = this.context
    if (context?.state !== 'running' || this.muted || this.disposed) return
    const oscillator = context.createOscillator()
    const envelope = context.createGain()
    oscillator.type = type
    oscillator.frequency.value = 440 * 2 ** ((midi - 69) / 12)
    const time = context.currentTime
    envelope.gain.setValueAtTime(0.0001, time)
    envelope.gain.exponentialRampToValueAtTime(volume, time + 0.008)
    envelope.gain.exponentialRampToValueAtTime(0.0001, time + duration)
    oscillator.connect(envelope)
    envelope.connect(context.destination)
    oscillator.start(time)
    oscillator.stop(time + duration + 0.02)
    oscillator.onended = () => {
      oscillator.disconnect()
      envelope.disconnect()
    }
  }

  pop() {
    this.note(79, 0.1, 0.035)
    this.note(91, 0.06, 0.012)
  }

  step(time: number) {
    if (!this.music || time < this.nextBeat) return false
    this.nextBeat = time + 60 / 112 / 2
    this.note(tune[this.beat % tune.length], 0.22, 0.035, 'triangle')
    if (this.beat % 4 === 0) this.note(this.beat % 8 === 0 ? 48 : 55, 0.25, 0.045)
    this.beat += 1
    return this.beat % 2 === 0
  }

  suspend() {
    this.stopVoices()
    this.nextBeat = 0
    void this.context?.suspend().catch(() => {})
  }

  resume() {
    if (!this.muted && this.context) void this.context.resume().catch(() => {})
  }

  private stopVoices() {
    for (const audio of this.voices) {
      audio.pause()
      audio.removeAttribute('src')
      audio.onended = null
    }
    this.voices.clear()
  }

  dispose() {
    this.disposed = true
    this.stopVoices()
    void this.context?.close().catch(() => {})
    this.context = null
  }
}
