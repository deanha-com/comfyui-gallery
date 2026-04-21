import { getImageUrl } from '@/lib/api'

function ChevronLeftIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18l6-6-6-6" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  )
}

function PanelIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="15" y1="3" x2="15" y2="21" />
    </svg>
  )
}

import MetadataPanel from './MetadataPanel'

export default function Lightbox({ images, currentIndex, metadata, onClose, onNavigate, onTogglePanel, panelOpen }) {
  if (currentIndex < 0 || !images[currentIndex]) return null

  const image = images[currentIndex]
  const total = images.length

  return (
    <div
      className="lightbox-fade-in fixed inset-0 z-50 flex items-center justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative z-10 w-full h-full flex">
        {/* Image section */}
        <div className="flex-1 flex items-center justify-center px-4 md:px-8">
          {/* Nav buttons */}
          <button
            onClick={(e) => { e.stopPropagation(); onNavigate(-1) }}
            className="absolute left-4 md:left-8 text-white/50 hover:text-white cursor-pointer transition-colors p-2"
            style={{ top: '50%', transform: 'translateY(-50%)' }}
          >
            <ChevronLeftIcon />
          </button>

          {/* Image */}
          <img
            src={getImageUrl(image)}
            alt={image}
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
            style={{ maxHeight: '90vh', maxWidth: '85vw' }}
          />

          <button
            onClick={(e) => { e.stopPropagation(); onNavigate(1) }}
            className="absolute right-4 md:right-8 text-white/50 hover:text-white cursor-pointer transition-colors p-2"
            style={{ top: '50%', transform: 'translateY(-50%)' }}
          >
            <ChevronRightIcon />
          </button>
        </div>

        {/* Metadata panel */}
        {panelOpen && (
          <div className="w-80 md:w-96 border-l border-[#2a4060] bg-[#1a1a2e]/95 backdrop-blur-md overflow-y-auto"
               style={{ maxHeight: '100vh' }}>
            {/* Panel header */}
            <div className="sticky top-0 z-10 px-4 py-3 border-b border-[#2a4060] flex items-center justify-between bg-[#1a1a2e]/95 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <span className="text-[#e94560]"><PanelIcon /></span>
                <span className="text-[10px] uppercase tracking-widest text-[#e94560] font-bold">Metadata</span>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onTogglePanel() }}
                className="text-gray-500 hover:text-white cursor-pointer transition-colors p-1"
                title="Close panel"
              >
                <CloseIcon />
              </button>
            </div>
            {/* Metadata */}
            <div className="py-1">
              {metadata ? <MetadataPanel metadata={metadata} /> : (
                <div className="p-4 text-center text-gray-600 text-sm">Loading metadata...</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 md:right-96 z-20 text-white/50 hover:text-white cursor-pointer transition-colors p-2"
      >
        <CloseIcon />
      </button>

      {/* Counter */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-white/40 font-mono">
        {currentIndex + 1} / {total}
      </div>
    </div>
  )
}
