import { ImageDropzone, ImageOutput } from '@/shared/ui'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ConvertButton } from './ConvertButton'
import { SeedInput } from './SeedInput'
import styles from './index.module.css'
import { applyBlackWhite } from './processors/bw'
import { applyDotEffect } from './processors/dot'
import { applyGrayscale } from './processors/grayscale'
import { applyInvert } from './processors/invert'
import { applyXor } from './processors/xor'

type EffectType = 'invert' | 'grayscale' | 'bw' | 'dot' | 'xor'

type EffectOption = {
  value: EffectType
  label: string
  description: string
}

const effectOptions: EffectOption[] = [
  { value: 'invert', label: 'ネガポジ', description: '色を反転してネガポジ変換します。' },
  { value: 'grayscale', label: 'グレースケール', description: '明度のみの画像に変換します。' },
  { value: 'bw', label: '黒白', description: 'しきい値で白黒の2値化を行います。' },
  { value: 'dot', label: 'ドット化', description: '明度に応じたドットで描画します。' },
  { value: 'xor', label: '画像暗号化', description: 'シード値でXOR変換します。' },
]

export const ImageTransform = () => {
  const [inputFile, setInputFile] = useState<File | null>(null)
  const [inputPreviewUrl, setInputPreviewUrl] = useState<string | null>(null)
  const [outputUrl, setOutputUrl] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [effect, setEffect] = useState<EffectType>('invert')
  const [threshold, setThreshold] = useState(128)
  const [dotSize, setDotSize] = useState(8)
  const [seed, setSeed] = useState<string>('')

  useEffect(() => {
    return () => {
      if (inputPreviewUrl) URL.revokeObjectURL(inputPreviewUrl)
    }
  }, [inputPreviewUrl])

  useEffect(() => {
    return () => {
      if (outputUrl) URL.revokeObjectURL(outputUrl)
    }
  }, [outputUrl])

  const selectedEffect = useMemo(
    () => effectOptions.find((option) => option.value === effect),
    [effect]
  )

  const clearOutput = useCallback(() => {
    setOutputUrl(null)
  }, [])

  const handleImageSelect = useCallback(
    (file: File) => {
      setInputFile(file)
      const url = URL.createObjectURL(file)
      setInputPreviewUrl(url)
      clearOutput()
    },
    [clearOutput]
  )

  const handleEffectChange = useCallback(
    (value: EffectType) => {
      setEffect(value)
      clearOutput()
    },
    [clearOutput]
  )

  const handleThresholdChange = useCallback(
    (value: number) => {
      setThreshold(value)
      clearOutput()
    },
    [clearOutput]
  )

  const handleDotSizeChange = useCallback(
    (value: number) => {
      setDotSize(value)
      clearOutput()
    },
    [clearOutput]
  )

  const handleSeedChange = useCallback(
    (newSeed: string) => {
      setSeed(newSeed)
      clearOutput()
    },
    [clearOutput]
  )

  const handleGenerateRandom = useCallback(() => {
    const randomSeed = Math.floor(Math.random() * 4294967296)
    setSeed(randomSeed.toString())
    clearOutput()
  }, [clearOutput])

  const handleConvert = useCallback(async () => {
    if (!inputFile || !inputPreviewUrl) return

    setIsProcessing(true)

    try {
      const img = new Image()
      const loadPromise = new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = () => reject(new Error('画像の読み込みに失敗しました'))
      })

      img.src = inputPreviewUrl
      await loadPromise

      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        throw new Error('Canvas contextの取得に失敗しました')
      }

      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

      if (effect === 'dot') {
        applyDotEffect(ctx, imageData, dotSize)
      } else if (effect === 'invert') {
        ctx.putImageData(applyInvert(imageData), 0, 0)
      } else if (effect === 'grayscale') {
        ctx.putImageData(applyGrayscale(imageData), 0, 0)
      } else if (effect === 'bw') {
        ctx.putImageData(applyBlackWhite(imageData, threshold), 0, 0)
      } else if (effect === 'xor') {
        const seedValue = parseInt(seed, 10)
        if (Number.isNaN(seedValue)) {
          throw new Error('シード値が不正です')
        }
        ctx.putImageData(applyXor(imageData, seedValue), 0, 0)
      }

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          setOutputUrl(url)
        }
      }, 'image/png')
    } catch (error) {
      console.error('変換エラー:', error)
      alert('画像の変換中にエラーが発生しました')
    } finally {
      setIsProcessing(false)
    }
  }, [dotSize, effect, inputFile, inputPreviewUrl, seed, threshold])

  const handleDownload = useCallback(() => {
    if (!outputUrl || !inputFile) return

    const link = document.createElement('a')
    link.href = outputUrl

    const originalName = inputFile.name
    const dotIndex = originalName.lastIndexOf('.')
    const baseName = dotIndex > 0 ? originalName.substring(0, dotIndex) : originalName

    link.download = `${baseName}_${effect}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [effect, inputFile, outputUrl])

  const isConvertDisabled = !inputFile || isProcessing || (effect === 'xor' && !seed)

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>画像変換ツール</h1>
      <p className={styles.description}>
        ネガポジ・黒白・グレースケール・ドット化・画像暗号化などを試せます。
      </p>

      <div className={styles.content}>
        <div className={styles.imageSection}>
          <ImageDropzone onImageSelect={handleImageSelect} previewUrl={inputPreviewUrl} />
        </div>

        <div className={styles.controlSection}>
          <div className={styles.controlCard}>
            <label className={styles.label} htmlFor="effect-select">
              変換モード
            </label>
            <select
              id="effect-select"
              className={styles.select}
              value={effect}
              onChange={(e) => handleEffectChange(e.target.value as EffectType)}
            >
              {effectOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className={styles.help}>{selectedEffect?.description}</p>
          </div>

          {effect === 'bw' && (
            <div className={styles.controlCard}>
              <label className={styles.label} htmlFor="threshold-range">
                しきい値: {threshold}
              </label>
              <input
                id="threshold-range"
                type="range"
                min={0}
                max={255}
                value={threshold}
                className={styles.range}
                onChange={(e) => handleThresholdChange(Number(e.target.value))}
              />
            </div>
          )}

          {effect === 'dot' && (
            <div className={styles.controlCard}>
              <label className={styles.label} htmlFor="dot-range">
                ドットサイズ: {dotSize}
              </label>
              <input
                id="dot-range"
                type="range"
                min={3}
                max={24}
                value={dotSize}
                className={styles.range}
                onChange={(e) => handleDotSizeChange(Number(e.target.value))}
              />
              <p className={styles.help}>大きいほど粗いドットになります。</p>
            </div>
          )}

          {effect === 'xor' && (
            <div className={styles.controlCard}>
              <SeedInput
                seed={seed}
                onSeedChange={handleSeedChange}
                onGenerateRandom={handleGenerateRandom}
              />
              <p className={styles.help}>同じシード値で2回変換すると元に戻ります。</p>
            </div>
          )}

          <ConvertButton
            onClick={handleConvert}
            disabled={isConvertDisabled}
            isProcessing={isProcessing}
          />
        </div>

        <div className={styles.imageSection}>
          <ImageOutput outputUrl={outputUrl} onDownload={handleDownload} />
        </div>
      </div>
    </div>
  )
}
