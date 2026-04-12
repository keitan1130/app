import { useCallback, useState } from 'react'
import type { ConvertResponse, InputMode } from '../types'
import { toMarkdownFileName } from '../utils/markitdownSource'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

const buildApiUrl = (path: string) => `${API_BASE_URL}${path}`

type ConvertParams = {
  inputMode: InputMode
  selectedFile: File | null
  manualInput: string
}

export const useMarkItDownConvert = () => {
  const [markdown, setMarkdown] = useState('')
  const [outputName, setOutputName] = useState('converted.md')
  const [isConverting, setIsConverting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const setOutputNameFromFileName = useCallback((name: string) => {
    setOutputName(toMarkdownFileName(name))
  }, [])

  const resetOutputName = useCallback(() => {
    setOutputName('converted.md')
  }, [])

  const clearError = useCallback(() => {
    setErrorMessage('')
  }, [])

  const clearMarkdown = useCallback(() => {
    setMarkdown('')
  }, [])

  const convert = useCallback(
    async ({ inputMode, selectedFile, manualInput }: ConvertParams) => {
      const isFileMode = inputMode === 'file'
      if (isFileMode && !selectedFile) return
      if (!isFileMode && !manualInput.trim()) return

      setIsConverting(true)
      setErrorMessage('')

      try {
        const response = await fetch(
          buildApiUrl('/api/v1/markitdown'),
          isFileMode
            ? (() => {
                const formData = new FormData()
                formData.append('file', selectedFile as File)
                return {
                  method: 'POST',
                  body: formData,
                }
              })()
            : {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ input: manualInput.trim() }),
              }
        )

        const data = ((await response.json().catch(() => null)) ?? null) as ConvertResponse | null
        if (!response.ok || !data?.ok || typeof data.markdown !== 'string') {
          const details = data?.details || data?.error || `status:${response.status}`
          throw new Error(details)
        }

        setMarkdown(data.markdown)
        if (isFileMode) {
          setOutputNameFromFileName(data.filename || (selectedFile as File).name)
        } else {
          const manualName = data.filename || 'manual-input.txt'
          setOutputNameFromFileName(manualName)
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : '変換に失敗しました'
        setErrorMessage(`変換エラー: ${message}`)
        setMarkdown('')
      } finally {
        setIsConverting(false)
      }
    },
    [setOutputNameFromFileName]
  )

  return {
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
  }
}
