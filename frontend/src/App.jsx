import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useGallery } from '@/hooks/useGallery'
import { useLightbox } from '@/hooks/useLightbox'
import { getMetadata } from '@/lib/api'

import FolderSelector from '@/components/FolderSelector'
import GalleryGrid from '@/components/GalleryGrid'
import SortControls from '@/components/SortControls'
import FilterInput from '@/components/FilterInput'
import Lightbox from '@/components/Lightbox'
import MetadataPanel from '@/components/MetadataPanel'

console.log('[App] App component rendering')

export default function App() {
  const gallery = useGallery()
  const lightbox = useLightbox()

  const [filterDraft, setFilterDraft] = useState('')
  const [metadata, setMetadata] = useState(null)
  const [isMounted, setIsMounted] = useState(false)
  const filterTimer = useRef(null)

  // Track mount for debugging
  useEffect(() => {
    console.log('[App] Mounted, scanFolder:', gallery.scanFolder, 'images:', gallery.images.length)
    setIsMounted(true)
  }, [])

  // Debounced filter
  const handleFilterChange = useCallback((val) => {
    setFilterDraft(val)
    clearTimeout(filterTimer.current)
    filterTimer.current = setTimeout(() => {
      console.log('[App] Applying filter:', val)
      gallery.setFilterText(val)
    }, 150)
  }, [gallery])

  // Sync filterDraft when gallery.filterText changes externally
  useEffect(() => {
    if (gallery.filterText !== filterDraft) {
      setFilterDraft(gallery.filterText)
    }
  }, [gallery.filterText, filterDraft])

  // Apply sort/filter
  useEffect(() => {
    if (isMounted) {
      gallery.applySortAndFilter()
      console.log('[App] applySortAndFilter called, filtered:', gallery.filteredImages.length)
    }
  }, [gallery.images, gallery.sortKey, gallery.filterText, isMounted])

  // Metadata when lightbox opens
  useEffect(() => {
    if (lightbox.isOpen && gallery.filteredImages[lightbox.currentIndex]) {
      const file = gallery.filteredImages[lightbox.currentIndex]
      console.log('[App] Lightbox open, fetching metadata for:', file)
      getMetadata(file)
        .then(m => { if (lightbox.isOpen) setMetadata(m) })
        .catch(e => console.error('[App] Metadata fetch error:', e))
    }
  }, [lightbox.isOpen, lightbox.currentIndex, gallery.filteredImages])

  const openLightbox = useCallback((index) => {
    console.log('[App] Opening lightbox at index:', index)
    lightbox.open(index)
  }, [lightbox])

  const closeLightbox = useCallback(() => {
    console.log('[App] Closing lightbox')
    lightbox.close()
    setMetadata(null)
  }, [lightbox])

  const navigateLightbox = useCallback((dir) => {
    lightbox.navigate(dir)
  }, [lightbox])

  const togglePanel = useCallback(() => {
    lightbox.setPanelOpen(p => !p)
  }, [lightbox])

  return (
    <div className="min-h-screen bg-[#1a1a2e] text-gray-200">
      {/* Header */}
      <header className="px-4 md:px-8 py-4 border-b border-[#2a4060] bg-[#16213e]/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex flex-col gap-4">
            {/* Title */}
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-[#e94560] text-2xl">⬡</span>
                ComfyUI Gallery
              </h1>
              {isMounted && (
                <span className="text-xs text-gray-600">
                  ({gallery.images.length} images)
                </span>
              )}
            </div>

            {/* Folder selector */}
            <FolderSelector
              scanFolder={gallery.scanFolder}
              onScan={gallery.scan}
              loading={gallery.loading}
              imageCount={gallery.images.length}
            />

            {/* Toolbar */}
            <div className="flex items-center gap-3 flex-wrap">
              <FilterInput
                filterText={filterDraft}
                onFilterChange={handleFilterChange}
              />
              <SortControls
                sortKey={gallery.sortKey}
                onSortChange={(val) => {
                  console.log('[App] Sort changed:', val)
                  gallery.setSortKey(val)
                }}
              />
            </div>

            {gallery.error && (
              <div className="text-xs text-[#e94560] bg-[#e94560]/10 border border-[#e94560]/20 px-3 py-2 rounded-lg">
                {gallery.error}
              </div>
            )}

            {/* Debug info */}
            <div className="text-[10px] text-gray-800 font-mono">
              scanFolder: "{gallery.scanFolder}" | images: {gallery.images.length} | filtered: {gallery.filteredImages.length} | sort: "{gallery.sortKey}" | filter: "{filterDraft}"
            </div>
          </div>
        </div>
      </header>

      {/* Main gallery */}
      <main className="max-w-[1600px] mx-auto px-4 md:px-8 py-6">
        {gallery.filteredImages.length === 0 && !gallery.loading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <div className="text-gray-700 text-6xl mb-4">⬡</div>
            <h2 className="text-xl font-semibold text-gray-500 mb-2">No images to display</h2>
            <p className="text-sm text-gray-700">
              Enter a ComfyUI output folder above to get started.
              PNG files from ComfyUI contain embedded generation metadata.
            </p>
            {gallery.error && (
              <p className="text-xs text-[#e94560] mt-2">{gallery.error}</p>
            )}
          </div>
        ) : (
          <GalleryGrid
            images={gallery.filteredImages}
            onOpen={openLightbox}
            allMetadata={gallery.allMetadata}
          />
        )}

        {gallery.images.length > 0 && (
          <div className="mt-4 text-xs text-gray-700 text-center">
            Showing {gallery.filteredImages.length} of {gallery.images.length} images
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="px-4 md:px-8 py-3 border-t border-[#2a4060] text-[10px] text-gray-800 text-center">
        ComfyUI Gallery Viewer • Click any image to view metadata
      </footer>

      {/* Lightbox */}
      {lightbox.isOpen && gallery.filteredImages[lightbox.currentIndex] && (
        <Lightbox
          images={gallery.filteredImages}
          currentIndex={lightbox.currentIndex}
          metadata={metadata}
          onClose={closeLightbox}
          onNavigate={navigateLightbox}
          onTogglePanel={togglePanel}
          panelOpen={lightbox.panelOpen}
        />
      )}
    </div>
  )
}
