import { useCallback, useRef } from 'react'
import voice1 from '@/assets/supikivoice/voice1.m4a'
import voice2 from '@/assets/supikivoice/voice2.m4a'
import voice3 from '@/assets/supikivoice/voice3.m4a'

const voices = [voice1, voice2, voice3]

export const useSupikiVoice = () => {
  const voiceIndexRef = useRef(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const playVoice = useCallback((random: boolean = false) => {
    // 前の音声を停止（play()のエラーは無視）
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      // 参照をクリアして、古いエラーが表示されないようにする
      audioRef.current = null
    }

    let index: number
    if (random) {
      index = Math.floor(Math.random() * voices.length)
    } else {
      index = voiceIndexRef.current
      voiceIndexRef.current = (voiceIndexRef.current + 1) % voices.length
    }

    const audio = new Audio(voices[index])
    audioRef.current = audio
    // AbortErrorは無視（前の音声の中断によるもの）
    audio.play().catch((error) => {
      if (error.name !== 'AbortError') {
        console.error(error)
      }
    })
  }, [])

  return { playVoice }
}
