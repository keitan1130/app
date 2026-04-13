import type { SourceType } from '../types'

const extensionTypeMap: Record<string, SourceType> = {
  pdf: { label: 'PDF', detail: 'PDF文書' },
  ppt: { label: 'PowerPoint', detail: 'PowerPointプレゼンテーション' },
  pptx: { label: 'PowerPoint', detail: 'PowerPointプレゼンテーション' },
  doc: { label: 'Word', detail: 'Word文書' },
  docx: { label: 'Word', detail: 'Word文書' },
  xls: { label: 'Excel', detail: 'Excelスプレッドシート' },
  xlsx: { label: 'Excel', detail: 'Excelスプレッドシート' },
  csv: { label: 'CSV', detail: 'CSVテキストデータ' },
  json: { label: 'JSON', detail: 'JSONテキストデータ' },
  xml: { label: 'XML', detail: 'XMLテキストデータ' },
  html: { label: 'HTML', detail: 'HTMLドキュメント' },
  htm: { label: 'HTML', detail: 'HTMLドキュメント' },
}

export const allowedFileExtensions = Object.keys(extensionTypeMap)

export const fileInputAccept = allowedFileExtensions.map((ext) => `.${ext}`).join(',')

export const supportedFormats = [
  'PDF',
  'PowerPoint',
  'Word',
  'Excel',
  'HTML',
  'Text(CSV, JSON, XML, HTML)',
]

export const toMarkdownFileName = (name: string) => {
  const dotIndex = name.lastIndexOf('.')
  const baseName = dotIndex > 0 ? name.slice(0, dotIndex) : name
  return `${baseName}.md`
}

export const formatBytes = (size: number) => {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${Math.ceil(size / 1024)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

export const detectSourceTypeFromFile = (file: File | null): SourceType => {
  if (!file) {
    return { label: '未選択', detail: 'ファイルを選択してください' }
  }

  const dotIndex = file.name.lastIndexOf('.')
  const ext = dotIndex > -1 ? file.name.slice(dotIndex + 1).toLowerCase() : ''
  if (ext && extensionTypeMap[ext]) {
    return extensionTypeMap[ext]
  }

  return { label: 'Unsupported', detail: 'このファイル形式は対応していません' }
}

export const detectSourceTypeFromManual = (input: string): SourceType => {
  const trimmed = input.trim()
  if (!trimmed) {
    return { label: '未入力', detail: 'HTML / CSV / JSON / XML を入力してください' }
  }

  const lowered = trimmed.toLowerCase()
  if (lowered.startsWith('<!doctype html') || lowered.startsWith('<html')) {
    return { label: 'HTML', detail: 'HTMLテキストとして変換します' }
  }

  if (
    (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
    (trimmed.startsWith('[') && trimmed.endsWith(']'))
  ) {
    return { label: 'JSON', detail: 'JSONテキストとして変換します' }
  }

  if (trimmed.startsWith('<?xml') || (trimmed.startsWith('<') && trimmed.endsWith('>'))) {
    return { label: 'XML', detail: 'XMLテキストとして変換します' }
  }

  if (trimmed.includes('<') && trimmed.includes('>')) {
    return { label: 'HTML', detail: 'HTMLテキストとして変換します' }
  }

  if (trimmed.includes(',') && trimmed.includes('\n')) {
    return { label: 'CSV', detail: 'CSVテキストとして変換します' }
  }

  return { label: 'Unsupported', detail: '手入力は HTML / CSV / JSON / XML のみ対応しています' }
}

export const isSupportedFile = (file: File | null) => {
  if (!file) return false
  const dotIndex = file.name.lastIndexOf('.')
  if (dotIndex < 0) return false
  const ext = file.name.slice(dotIndex + 1).toLowerCase()
  return Boolean(extensionTypeMap[ext])
}

export const isSupportedManualInput = (input: string) => {
  const detected = detectSourceTypeFromManual(input)
  return (
    detected.label === 'HTML' ||
    detected.label === 'CSV' ||
    detected.label === 'JSON' ||
    detected.label === 'XML'
  )
}
