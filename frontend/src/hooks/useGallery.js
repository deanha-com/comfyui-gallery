import { useState, useCallback } from 'react'
import { scanFolder as apiScan } from '@/lib/api'

export function useGallery() {
  const [scanFolder, setScanFolder] = useState('')
  const [images, setImages] = useState([])
  const [filteredImages, setFilteredImages] = useState([])
  const [sortKey, setSortKey] = useState('desc')
  const [filterText, setFilterText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [allMetadata, setAllMetadata] = useState({})

  console.log('[App] useGallery initialized:', { scanFolder, images: images.length })

  const scan = useCallback(async (path) => {
    console.log('[useGallery] scan() called with path:', path)
    setLoading(true)
    setError('')
    try {
      const result = await apiScan(path)
      console.log('[useGallery] scan() result:', result)
      setScanFolder(result.scan_folder)
      setImages(result.images)
      setFilteredImages(result.images)
      setAllMetadata({})
      console.log('[useGallery] state updated - images:', result.images.length)
    } catch (e) {
      console.error('[useGallery] scan() failed:', e)
      setError(e.message || 'Scan failed')
    } finally {
      setLoading(false)
    }
  }, [])

  const applySort = useCallback((fileList) => {
    const sorted = [...fileList]
    sorted.sort((a, b) => {
      const aMd = allMetadata[a] || { modified_time: '', width: 0, height: 0 }
      const bMd = allMetadata[b] || { modified_time: '', width: 0, height: 0 }
      switch (sortKey) {
        case 'asc': return (aMd.modified_time || '').localeCompare(bMd.modified_time || '')
        case 'name-asc': return a.localeCompare(b)
        case 'name-desc': return b.localeCompare(a)
        case 'width-desc': return (bMd.width || 0) - (aMd.width || 0)
        case 'width-asc': return (aMd.width || 0) - (bMd.width || 0)
        case 'height-desc': return (bMd.height || 0) - (aMd.height || 0)
        case 'height-asc': return (aMd.height || 0) - (bMd.height || 0)
        case 'megapixels-desc': return ((bMd.width||0)*(bMd.height||0)) - ((aMd.width||0)*(aMd.height||0))
        case 'megapixels-asc': return ((aMd.width||0)*(aMd.height||0)) - ((bMd.width||0)*(bMd.height||0))
        default: return (bMd.modified_time || '').localeCompare(aMd.modified_time || '')
      }
    })
    return sorted
  }, [sortKey, allMetadata])

  const applyFilter = useCallback((fileList) => {
    if (!filterText.trim()) return fileList
    const q = filterText.toLowerCase()
    return fileList.filter(f => {
      if (f.toLowerCase().includes(q)) return true
      const m = allMetadata[f]
      if (!m) return false
      return (m.tags?.some(t => t.toLowerCase().includes(q)))
        || (m.prompt?.toLowerCase().includes(q))
        || (m.negative_prompt?.toLowerCase().includes(q))
        || (m.model?.toLowerCase().includes(q))
    })
  }, [filterText, allMetadata])

  // Apply sort and filter whenever images/sort/filter change
  const applySortAndFilter = useCallback(() => {
    if (!images.length) {
      setFilteredImages([])
      return
    }
    let r = applySort(images)
    r = applyFilter(r)
    setFilteredImages(r)
  }, [images, applySort, applyFilter])

  const fetchMetadata = useCallback(async (filename) => {
    if (allMetadata[filename]) return allMetadata[filename]
    try {
      const meta = await getMetadata(filename)
      setAllMetadata(prev => ({ ...prev, [filename]: meta }))
      return meta
    } catch {
      return null
    }
  }, [allMetadata])

  const handleSaveTags = async (image, tags) => {
    await saveTags(image, tags)
  }

  return {
    scanFolder, setScanFolder,
    images, setImages,
    filteredImages, setFilteredImages,
    sortKey, setSortKey,
    filterText, setFilterText,
    loading, error, allMetadata, setAllMetadata,
    scan, applySortAndFilter, fetchMetadata, handleSaveTags,
  }
}
