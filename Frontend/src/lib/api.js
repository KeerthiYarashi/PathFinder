import { supabase } from './supabase'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

export async function authenticatedFetch(endpoint, options = {}) {
  // Always get the freshest session directly from Supabase to prevent stale token usage
  const { data: { session } } = await supabase.auth.getSession()
  
  const headers = new Headers(options.headers || {})
  
  // Do not set Content-Type for FormData so the browser automatically sets the correct multipart boundary
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (session?.access_token) {
    headers.set('Authorization', `Bearer ${session.access_token}`)
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    let errDetail = 'API request failed'
    try {
      const errData = await response.json()
      errDetail = errData.detail || errData.message || errDetail
    } catch (e) {
      // JSON parse failed
    }
    throw new Error(errDetail)
  }

  return response.json()
}
