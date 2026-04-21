import { memo, useState, useEffect } from 'react'
import { getImageUrl } from '@/lib/api'

function TagChip({ tag, colorIndex }) {
  const colors = [
    'bg-[#e94560]/20 text-[#e94560] hover:bg-[#e94560]/40',
    'bg-[#00b4d8]/20 text-[#00b4d8] hover:bg-[#00b4d8]/40',
    'bg-[#f0c832]/20 text-[#f0c832] hover:bg-[#f0c832]/40',
    'bg-[#7b61ff]/20 text-[#7b61ff] hover:bg-[#7b61ff]/40',
    'bg-[#34d399]/20 text-[#34d399] hover:bg-[#34d399]/40',
    'bg-[#f97316]/20 text-[#f97316] hover:bg-[#f97316]/40',
  ]
  return (
    <span className={`tag-chip ${colors[colorIndex % colors.length]}`}>
      {tag}
    </span>
  )
}

const GalleryCard = memo(function GalleryCard({ image, onOpen, allMetadata }) {
  const [loaded, setLoaded] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [meta, setMeta] = useState(allMetadata[image] || null)

  useEffect(() => {
    if (allMetadata[image]) setMeta(allMetadata[image])
  }, [allMetadata, image])

  const m = meta || allMetadata[image]

  return (
    <div
      className="masonry-item group cursor-pointer"
      onClick={onOpen}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={`card-hover rounded-xl overflow-hidden border border-transparent bg-[#16213e] transition-all duration-300 ${hovered ? 'border-[#e94560]/30' : ''}`}>
        {/* Image */}
        <div className="relative bg-[#0f0f1a] overflow-hidden">
          {!loaded && (
            <div className="w-full aspect-square flex items-center justify-center bg-[#0f0f1a]">
              <div className="spinner border-[#1a3a5a] border-t-[#e94560]"></div>
            </div>
          )}
          <img
            src={getImageUrl(image)}
            alt={image}
            className={`w-full h-auto object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0 absolute'}`}
            onLoad={() => setLoaded(true)}
          />
          <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-200 ${hovered ? 'opacity-100' : 'opacity-0'}`} />
        </div>

        {/* Info */}
        <div className="p-3">
          <p className="text-xs text-gray-400 line-clamp-2 mb-2" style={{ fontFamily: 'monospace' }}>
            {image}
          </p>
          {m?.width && m?.height && (
            <span className="text-xs font-mono text-[#00b4d8] bg-[#00b4d8]/10 px-1.5 py-0.5 rounded">
              {m.width}x{m.height}
            </span>
          )}
          {m?.tags && m.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {m.tags.slice(0, 4).map((tag, i) => (
                <TagChip key={tag} tag={tag} colorIndex={i} />
              ))}
              {m.tags.length > 4 && (
                <span className="tag-chip bg-white/10 text-gray-400 hover:bg-white/20">
                  +{m.tags.length - 4}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}, (prev, next) => {
  return prev.image === next.image && prev.allMetadata === next.allMetadata
})

export default GalleryCard
