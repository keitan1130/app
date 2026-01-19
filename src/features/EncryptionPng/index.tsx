import { useCallback, useState } from 'react'
import { ConvertButton } from './ConvertButton'
import { ImageDropzone } from './ImageDropzone'
import { ImageOutput } from './ImageOutput'
import styles from './index.module.css'
import { SeedInput } from './SeedInput'

/**
 * 画像を読み込み、固定の乱数パターンとの XOR 演算を行い、
 * ノイズ状の画像を出力する（同じ処理を2回適用すると元に戻る）。
 */
const toggleImage = async (imageData: ImageData, seed: number): Promise<ImageData> => {
  const { width, height, data } = imageData
  const newData = new Uint8ClampedArray(data.length)

  // シード付き乱数生成器（mulberry32）
  const mulberry32 = (seed: number) => {
    return () => {
      let t = (seed += 0x6d2b79f5)
      t = Math.imul(t ^ (t >>> 15), t | 1)
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
  }

  const random = mulberry32(seed)

  // XOR演算で画像変換
  for (let i = 0; i < data.length; i++) {
    // アルファチャンネル（4番目の要素）はそのまま保持
    if ((i + 1) % 4 === 0) {
      newData[i] = data[i]
    } else {
      const randomValue = Math.floor(random() * 256)
      newData[i] = data[i] ^ randomValue
    }
  }

  return new ImageData(newData, width, height)
}

export const EncryptionPng = () => {
  const [inputFile, setInputFile] = useState<File | null>(null)
  const [inputPreviewUrl, setInputPreviewUrl] = useState<string | null>(null)
  const [outputUrl, setOutputUrl] = useState<string | null>(null)
  const [seed, setSeed] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)

  const handleImageSelect = useCallback((file: File) => {
    setInputFile(file)

    // プレビューURLの作成
    const url = URL.createObjectURL(file)
    setInputPreviewUrl(url)

    // 出力をクリア
    setOutputUrl(null)
  }, [])

  const handleSeedChange = useCallback((newSeed: string) => {
    setSeed(newSeed)
  }, [])

  const handleGenerateRandom = useCallback(() => {
    // 0 から 2^32 - 1 の範囲でランダムなシードを生成
    const randomSeed = Math.floor(Math.random() * 4294967296)
    setSeed(randomSeed.toString())
  }, [])

  const handleConvert = useCallback(async () => {
    if (!inputFile || !seed) return

    setIsProcessing(true)

    try {
      // 画像をCanvasに読み込み
      const img = new Image()
      const loadPromise = new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = () => reject(new Error('画像の読み込みに失敗しました'))
      })

      img.src = inputPreviewUrl!
      await loadPromise

      // Canvasに描画してImageDataを取得
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        throw new Error('Canvas contextの取得に失敗しました')
      }

      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

      // XOR変換を実行
      const toggledData = await toggleImage(imageData, parseInt(seed, 10))

      // 結果をCanvasに描画
      ctx.putImageData(toggledData, 0, 0)

      // BlobURLを生成
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
  }, [inputFile, inputPreviewUrl, seed])

  const handleDownload = useCallback(() => {
    if (!outputUrl || !inputFile) return

    const link = document.createElement('a')
    link.href = outputUrl

    // 元のファイル名をベースに出力ファイル名を生成（常にPNG形式）
    const originalName = inputFile.name
    const dotIndex = originalName.lastIndexOf('.')
    const baseName = dotIndex > 0 ? originalName.substring(0, dotIndex) : originalName

    link.download = `${baseName}_converted.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [outputUrl, inputFile])

  const isConvertDisabled = !inputFile || !seed

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>画像暗号化ツール</h1>
      <p className={styles.description}>同じシード値で2回変換すると元の画像に戻ります。</p>

      <div className={styles.content}>
        <div className={styles.imageSection}>
          <ImageDropzone onImageSelect={handleImageSelect} previewUrl={inputPreviewUrl} />
        </div>

        <div className={styles.controlSection}>
          <SeedInput
            seed={seed}
            onSeedChange={handleSeedChange}
            onGenerateRandom={handleGenerateRandom}
          />
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
