import { useCallback, useMemo, useRef, useState } from 'react'
import { ControlSection, InputSection, OutputSection } from './components'
import { useMarkItDownConvert } from './hooks/useMarkItDownConvert'
import styles from './index.module.css'
import type { InputMode } from './types'
import {
  detectSourceTypeFromFile,
  detectSourceTypeFromManual,
  formatBytes,
  supportedFormats,
} from './utils/markitdownSource'

export const MarkItDown = () => {
  const [inputMode, setInputMode] = useState<InputMode>('file')
  const [isModeMenuOpen, setIsModeMenuOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [manualInput, setManualInput] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)
  const [copied, setCopied] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    markdown,
    outputName,
    isConverting,
    errorMessage,
    setErrorMessage,
    setOutputNameFromFileName,
    resetOutputName,
    clearError,
    clearMarkdown,
    convert,
  } = useMarkItDownConvert()

  const hasResult = markdown.trim().length > 0

  const modeLabel = useMemo(() => {
    return inputMode === 'file' ? 'ファイルを選択' : '手入力（URL / テキスト）'
  }, [inputMode])

  const selectedFileLabel = useMemo(() => {
    if (!selectedFile) return '未選択'
    return `${selectedFile.name} (${formatBytes(selectedFile.size)})`
  }, [selectedFile])

  const detectedSourceType = useMemo(() => {
    return inputMode === 'file'
      ? detectSourceTypeFromFile(selectedFile)
      : detectSourceTypeFromManual(manualInput)
  }, [inputMode, manualInput, selectedFile])

  const handleModeChange = useCallback(
    (mode: InputMode) => {
      setInputMode(mode)
      clearError()
      setCopied(false)
      setIsModeMenuOpen(false)
    },
    [clearError]
  )

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] ?? null
      setSelectedFile(file)
      setCopied(false)
      clearError()
      if (!file) {
        clearMarkdown()
        resetOutputName()
        return
      }
      setOutputNameFromFileName(file.name)
    },
    [clearError, clearMarkdown, resetOutputName, setOutputNameFromFileName]
  )

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      event.stopPropagation()
      setIsDragOver(false)

      const file = event.dataTransfer.files?.[0] ?? null
      setSelectedFile(file)
      clearError()
      setCopied(false)

      if (!file) {
        resetOutputName()
        return
      }

      setOutputNameFromFileName(file.name)
    },
    [clearError, resetOutputName, setOutputNameFromFileName]
  )

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDropzoneClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleManualInputChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setManualInput(event.target.value)
      setCopied(false)
      clearError()
    },
    [clearError]
  )

  const handleConvert = useCallback(() => {
    setCopied(false)
    void convert({ inputMode, selectedFile, manualInput })
  }, [convert, inputMode, manualInput, selectedFile])

  const handleCopy = useCallback(async () => {
    if (!hasResult) return
    try {
      await navigator.clipboard.writeText(markdown)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setErrorMessage('クリップボードへのコピーに失敗しました')
    }
  }, [hasResult, markdown, setErrorMessage])

  const handleDownload = useCallback(() => {
    if (!hasResult) return
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = outputName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [hasResult, markdown, outputName])

  const isConvertDisabled =
    isConverting || (inputMode === 'file' ? !selectedFile : !manualInput.trim())

  return (
    <section className={styles.container}>
      <div className={styles.content}>
        <InputSection
          inputMode={inputMode}
          selectedFile={selectedFile}
          manualInput={manualInput}
          isDragOver={isDragOver}
          selectedFileLabel={selectedFileLabel}
          fileInputRef={fileInputRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onDropzoneClick={handleDropzoneClick}
          onFileChange={handleFileChange}
          onManualInputChange={handleManualInputChange}
        />

        <ControlSection
          modeLabel={modeLabel}
          isModeMenuOpen={isModeMenuOpen}
          detectedSourceType={detectedSourceType}
          isConvertDisabled={isConvertDisabled}
          isConverting={isConverting}
          errorMessage={errorMessage}
          supportedFormats={supportedFormats}
          onToggleModeMenu={() => setIsModeMenuOpen((current) => !current)}
          onCloseModeMenu={() => setIsModeMenuOpen(false)}
          onModeChange={handleModeChange}
          onConvert={handleConvert}
        />

        <OutputSection
          markdown={markdown}
          outputName={outputName}
          hasResult={hasResult}
          copied={copied}
          onCopy={() => void handleCopy()}
          onDownload={handleDownload}
        />
      </div>
    </section>
  )
}

export default MarkItDown
