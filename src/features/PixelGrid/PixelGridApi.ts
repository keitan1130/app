export type GridSize = 32

export type GridResponse = {
  id: string
  grid_size: number
  cells: string[]
  version: number
  updated_at: string
}

export type UpdateCellResponse = {
  ok: boolean
  version?: number
  error?: string
  current_version?: number
}

export type UpdateCellPayload = {
  id: string
  index: number
  color: string
  if_match_version: number
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
const GET_RETRY_DELAYS_MS = [300, 900]
const POST_NETWORK_RETRY_DELAY_MS = 300

const buildApiUrl = (path: string) => `${API_BASE_URL}${path}`

const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms))

const isNetworkError = (error: unknown) => error instanceof TypeError

const isRetryable5xx = (status: number) => status >= 500 && status <= 599

export const fetchGrid = async (canvasId: string): Promise<GridResponse> => {
  for (let attempt = 0; attempt <= GET_RETRY_DELAYS_MS.length; attempt += 1) {
    try {
      const response = await fetch(buildApiUrl(`/api/v1/grid?id=${encodeURIComponent(canvasId)}`))
      if (response.ok) {
        return (await response.json()) as GridResponse
      }

      if (attempt < GET_RETRY_DELAYS_MS.length && isRetryable5xx(response.status)) {
        await wait(GET_RETRY_DELAYS_MS[attempt])
        continue
      }

      throw new Error(`grid_fetch_failed:${response.status}`)
    } catch (error) {
      if (attempt < GET_RETRY_DELAYS_MS.length && isNetworkError(error)) {
        await wait(GET_RETRY_DELAYS_MS[attempt])
        continue
      }

      throw error
    }
  }

  throw new Error('grid_fetch_failed:retry_exhausted')
}

export const updateCell = async (
  payload: UpdateCellPayload
): Promise<{ kind: 'ok'; version: number } | { kind: 'conflict' }> => {
  for (let attempt = 0; attempt <= 1; attempt += 1) {
    try {
      const response = await fetch(buildApiUrl('/api/v1/cell'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.status === 409) {
        return { kind: 'conflict' }
      }

      if (!response.ok) {
        throw new Error(`cell_update_failed:${response.status}`)
      }

      const data = (await response.json()) as UpdateCellResponse
      if (!data.ok || typeof data.version !== 'number') {
        throw new Error(data.error || 'cell_update_invalid_response')
      }

      return { kind: 'ok', version: data.version }
    } catch (error) {
      if (attempt === 0 && isNetworkError(error)) {
        await wait(POST_NETWORK_RETRY_DELAY_MS)
        continue
      }

      throw error
    }
  }

  throw new Error('cell_update_failed:retry_exhausted')
}
