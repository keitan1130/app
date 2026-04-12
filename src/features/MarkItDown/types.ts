export type ConvertResponse = {
  ok: boolean
  filename?: string
  markdown?: string
  error?: string
  details?: string
}

export type InputMode = 'file' | 'manual'

export type SourceType = {
  label: string
  detail: string
}
