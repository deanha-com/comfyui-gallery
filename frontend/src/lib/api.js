const BASE = '/api'
const IMAGE_BASE = '/images'

function logApi(method, url, status, data) {
  console.log(`[API] ${method} ${url} -> ${status}`, data || '')
}

function logApiError(method, url, err) {
  console.error(`[API] ${method} ${url} FAILED`, err)
}

async function fetchJSON(url, options = {}) {
  console.log(`[API] Fetching ${url}`, options.method || 'GET', options.body ? JSON.stringify(options.body) : '')
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
    body: options.body && typeof options.body === 'object'
      ? JSON.stringify(options.body)
      : options.body,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`${res.status} ${res.statusText}: ${text}`)
  }
  const data = await res.json()
  logApi(options.method || 'GET', url, res.status, data)
  return data
}

// Scan a folder
export async function scanFolder(folderPath) {
  try {
    const result = await fetchJSON(`${BASE}/scan`, {
      method: 'POST',
      body: { folder_path: folderPath },
    })
    return result
  } catch (e) {
    logApiError('POST', `${BASE}/scan`, e)
    throw e
  }
}

// Get metadata for a single image
export async function getMetadata(filename) {
  try {
    const result = await fetchJSON(`${BASE}/metadata/${encodeURIComponent(filename)}`)
    return result
  } catch (e) {
    logApiError('POST', `${BASE}/metadata/${filename}`, e)
    // Return a minimal fallback so the UI doesn't crash
    return {
      file_path: filename,
      width: 0, height: 0,
      prompt: '', negative_prompt: '',
      tags: [], workflow_node: '',
      seed: null, steps: null, cfg: null,
      sampler: null, scheduler: null,
      model: null, loras: [], vae: null,
      clip_skip: null, error: String(e),
      original_user_tags: [],
    }
  }
}

// Get current settings
export async function getSettings() {
  try {
    return await fetchJSON(`${BASE}/settings`)
  } catch (e) {
    logApiError('GET', `${BASE}/settings`, e)
    return {}
  }
}

// Save user tags
export async function saveTags(image, tags) {
  try {
    return await fetchJSON(`${BASE}/tags/save`, {
      method: 'POST',
      body: { image, tags },
    })
  } catch (e) {
    logApiError('POST', `${BASE}/tags/save`, e)
    throw e
  }
}

// Construct image URL
export function getImageUrl(filename) {
  return `${IMAGE_BASE}/${encodeURIComponent(filename)}`
}
