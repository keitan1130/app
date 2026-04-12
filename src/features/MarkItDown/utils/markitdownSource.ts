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
  txt: { label: 'Text', detail: 'テキストファイル' },
  md: { label: 'Text', detail: 'Markdownテキスト' },
  html: { label: 'HTML', detail: 'HTMLドキュメント' },
  htm: { label: 'HTML', detail: 'HTMLドキュメント' },
  zip: { label: 'ZIP', detail: 'ZIPアーカイブ' },
  epub: { label: 'EPub', detail: 'EPub電子書籍' },
  png: { label: 'Image', detail: '画像ファイル（OCR/EXIF対象）' },
  jpg: { label: 'Image', detail: '画像ファイル（OCR/EXIF対象）' },
  jpeg: { label: 'Image', detail: '画像ファイル（OCR/EXIF対象）' },
  webp: { label: 'Image', detail: '画像ファイル（OCR/EXIF対象）' },
  gif: { label: 'Image', detail: '画像ファイル（OCR/EXIF対象）' },
  bmp: { label: 'Image', detail: '画像ファイル（OCR/EXIF対象）' },
  mp3: { label: 'Audio', detail: '音声ファイル（文字起こし対象）' },
  wav: { label: 'Audio', detail: '音声ファイル（文字起こし対象）' },
  m4a: { label: 'Audio', detail: '音声ファイル（文字起こし対象）' },
  aac: { label: 'Audio', detail: '音声ファイル（文字起こし対象）' },
  ogg: { label: 'Audio', detail: '音声ファイル（文字起こし対象）' },
  flac: { label: 'Audio', detail: '音声ファイル（文字起こし対象）' },
}

export const supportedFormats = [
  'PDF',
  'PowerPoint',
  'Word',
  'Excel',
  'Images (EXIF metadata and OCR)',
  'Audio (EXIF metadata and speech transcription)',
  'HTML',
  'Text-based formats (CSV, JSON, XML)',
  'ZIP files (iterates over contents)',
  'Youtube URLs',
  'EPubs',
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

  if (file.type.startsWith('image/')) {
    return { label: 'Image', detail: '画像ファイル（OCR/EXIF対象）' }
  }

  if (file.type.startsWith('audio/')) {
    return { label: 'Audio', detail: '音声ファイル（文字起こし対象）' }
  }

  return { label: 'Unknown', detail: '拡張子またはMIMEから判定できませんでした' }
}

export const detectSourceTypeFromManual = (input: string): SourceType => {
  const trimmed = input.trim()
  if (!trimmed) {
    return { label: '未入力', detail: 'URLまたはテキストを入力してください' }
  }

  try {
    const url = new URL(trimmed)
    const host = url.hostname.toLowerCase()
    if (host.includes('youtube.com') || host.includes('youtu.be')) {
      return { label: 'YouTube URL', detail: 'YouTube動画URLとして認識しました' }
    }

    const pathname = url.pathname.toLowerCase()
    const ext = pathname.includes('.') ? (pathname.split('.').pop() ?? '') : ''
    if (ext && extensionTypeMap[ext]) {
      return {
        label: extensionTypeMap[ext].label,
        detail: `${extensionTypeMap[ext].detail} のURL`,
      }
    }

    return { label: 'URL', detail: 'リモートURLとして変換します' }
  } catch {
    // URLではないので文字列を簡易判定する
  }

  if (
    (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
    (trimmed.startsWith('[') && trimmed.endsWith(']'))
  ) {
    return { label: 'JSON', detail: 'JSONテキストとして変換します' }
  }

  if (trimmed.startsWith('<?xml') || (trimmed.startsWith('<') && trimmed.endsWith('>'))) {
    return { label: 'XML/HTML', detail: 'XMLまたはHTMLテキストとして変換します' }
  }

  if (trimmed.includes(',') && trimmed.includes('\n')) {
    return { label: 'CSV/Text', detail: '区切りテキストとして変換します' }
  }

  return { label: 'Text', detail: 'プレーンテキストとして変換します' }
}
