import { ApiResponse } from '../types/api'

export const GAS_URL = "https://script.google.com/macros/s/AKfycbx9KplRj5m9rqIfMJt9VlcptrmqZ2lD_AVxA3nOidlwXhneFBnoMFNVkxcWO2G80K9r4Q/exec";

export async function fetchApi<T = unknown>(action: string, payload: Record<string, unknown> = {}): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(GAS_URL, {
      method: "POST",
      body: JSON.stringify({ action, ...payload })
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result = await response.json()
    // GAS wrapper mapping, assuming the backend uses 'success'/'status' boolean
    // and 'data' block
    return {
      status: result.success || result.status || false,
      message: result.message || '',
      data: result.data
    }
  } catch (error: unknown) {
    console.error(`[API Error - ${action}]:`, error)
    return {
      status: false,
      message: error instanceof Error ? error.message : "Gagal menghubungi server",
    }
  }
}
