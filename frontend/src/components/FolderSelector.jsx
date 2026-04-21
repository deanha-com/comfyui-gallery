import { useState, useCallback, useEffect, useRef } from 'react'
import { scanFolder as apiScan } from '@/lib/api'

export default function FolderSelector({ scanFolder, onScan, loading, imageCount }) {
  const [path, setPath] = useState(scanFolder || '')
  const [error, setError] = useState('')

  const handleScan = useCallback(async () => {
    const trimmed = path.trim()
    console.log('[FolderSelector] handleScan called, path:', trimmed, 'loading:', loading)
    if (!trimmed) {
      setError('Please enter a folder path')
      return
    }
    if (loading) {
      console.log('[FolderSelector] Already loading, skipping')
      return
    }
    setError('')
    console.log('[FolderSelector] Calling onScan with:', trimmed)
    try {
      await onScan(trimmed)
      setPath(trimmed)
    } catch (e) {
      console.error('[FolderSelector] onScan failed:', e)
      setError(e.message || 'Scan failed')
    }
  }, [path, loading, onScan])

  // Re-sync path when scanFolder prop updates
  useEffect(() => {
    if (scanFolder && scanFolder !== path) {
      console.log('[FolderSelector] scanFolder prop changed:', scanFolder)
      setPath(scanFolder)
    }
  }, [scanFolder, path])

  const handleBrowse = useCallback(() => {
    if (window.showDirectoryPicker) {
      window.showDirectoryPicker().then(async (dirHandle) => {
        console.log('[FolderSelector] Folder picker returned:', dirHandle.name)
        try {
          const items = []
          async function walk(handle, prefix) {
            if (handle.kind === 'file') {
              const ext = handle.name.slice(handle.name.lastIndexOf('.')).toLowerCase()
              if (['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) {
                items.push(prefix + handle.name)
              }
            } else if (handle.kind === 'directory') {
              for await (const entry of handle.values()) {
                await walk(entry, prefix + handle.name + '\\')
              }
            }
          }
          await walk(dirHandle, '')
          console.log('[FolderSelector] Found', items.length, 'images')
          if (items.length === 0) {
            setError('No image files found in selected folder')
            return
          }
          console.log('[FolderSelector] Scanning with browser path')
          setError('')
          await onScan(dirHandle.name)
        } catch (e) {
          console.error('[FolderSelector] Browse scan failed:', e)
          setError(e.message || 'Scan failed')
        }
      }).catch((e) => {
        if (e.name !== 'AbortError') {
          console.error('[FolderSelector] Folder picker error:', e)
        }
      })
    } else {
      setError('Folder picker not supported. Enter path manually.')
    }
  }, [onScan])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') handleScan()
  }, [handleScan])

  const handleChange = useCallback((e) => {
    setPath(e.target.value)
    if (error) setError('')
  }, [error])

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 flex-wrap">
      <div className="flex items-center gap-2 flex-1 min-w-[300px]">
        {/* Folder icon */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className="text-[#e94560] flex-shrink-0">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
        </svg>
        <input
          type="text"
          value={path}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="C:\ComfyUI\output\images (or paste a folder path)"
          spellCheck={false}
          className="flex-1 min-w-0 bg-[#16213e] border border-[#2a4060] rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#e94560] transition-colors"
        />
        {/* Browse button */}
        <button
          type="button"
          onClick={handleBrowse}
          title="Browse for folder"
          className="flex-shrink-0 bg-[#0f3460] hover:bg-[#1a4a7a] border border-[#2a4060] rounded-lg px-3 py-2 text-sm text-gray-300 hover:text-white cursor-pointer transition-colors"
        >
          Browse
        </button>
      </div>
      {/* Scan button */}
      <button
        type="button"
        onClick={handleScan}
        disabled={loading}
        className="flex items-center gap-2 bg-[#e94560] hover:bg-[#d43b55] disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg px-6 py-2 text-sm font-semibold cursor-pointer transition-colors flex-shrink-0"
      >
        {loading ? 'Scanning...' : 'Scan'}
      </button>
      {/* Image count */}
      {imageCount > 0 && (
        <span className="px-3 py-1 bg-[#0f3460] border border-[#2a4060] rounded-full text-xs text-[#00b4d8] flex-shrink-0">
          {imageCount} images
        </span>
      )}
      {/* Error */}
      {error && (
        <span className="w-full text-xs text-[#e94560]">{error}</span>
      )}
    </div>
  )
}
