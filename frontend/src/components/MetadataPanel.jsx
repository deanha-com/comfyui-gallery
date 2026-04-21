import { useState, useCallback, useMemo } from 'react'

function ChevronIcon({ open }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={`transition-transform duration-200 ${open ? '' : '-rotate-90'}`}>
      <path d="M9 18l6-6-6-6" />
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  )
}

function CopyIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

function Section({ title, icon: Icon, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  const content = useMemo(() => open, [open])

  // Get children as a single element since they'll be wrapped in context
  return { open, setOpen, content: { open } }
}

function CopyableText({ text, label, maxHeight = 200 }) {
  const [copied, setCopied] = useState(false)
  const onCopy = useCallback(() => {
    navigator.clipboard.writeText(text || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [text])

  return (
    <div className="relative group">
      {label && (
        <span className="text-[10px] text-gray-600 uppercase tracking-wider mb-1 block">{label}</span>
      )}
      <div className={`bg-[#0f0f1a] border border-[#2a4060] rounded-lg text-xs text-gray-300 font-mono whitespace-pre-wrap break-words overflow-y-auto`}
           style={{ maxHeight: `${maxHeight}px`, padding: '0.5rem' }}>
        {text || <span className="text-gray-700 italic">Not available</span>}
      </div>
      <button
        onClick={onCopy}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 cursor-pointer text-gray-500 hover:text-white transition-opacity p-1"
        title="Copy"
      >
        {copied ? (
          <span className="text-[#34d399] text-[10px]">Copied!</span>
        ) : (
          <CopyIcon />
        )}
      </button>
    </div>
  )
}

const tagColors = [
  'bg-[#e94560]/20 text-[#e94560] hover:bg-[#e94560]/40',
  'bg-[#00b4d8]/20 text-[#00b4d8] hover:bg-[#00b4d8]/40',
  'bg-[#f0c832]/20 text-[#f0c832] hover:bg-[#f0c832]/40',
  'bg-[#7b61ff]/20 text-[#7b61ff] hover:bg-[#7b61ff]/40',
  'bg-[#34d399]/20 text-[#34d399] hover:bg-[#34d399]/40',
  'bg-[#f97316]/20 text-[#f97316] hover:bg-[#f97316]/40',
]

export default function MetadataPanel({ metadata }) {
  if (!metadata) return null

  return (
    <div className="lightbox-slide-in">
      {/* Header */}
      <div className="px-3 py-2 border-b border-[#2a4060]">
        <span className="text-[10px] text-gray-700 font-mono truncate block">{metadata.file_path || ''}</span>
      </div>

      {/* Prompt */}
      <details className="border-b border-[#2a4060]" open>
        <summary className="flex items-center gap-2 px-3 py-2 cursor-pointer text-gray-400 hover:text-white text-xs uppercase tracking-wider font-semibold">
          <ChevronIcon open />
          <span className="text-[#e94560]"><InfoIcon /></span>
          Prompt
        </summary>
        <div className="px-3 pb-2">
          <CopyableText text={metadata.prompt} />
          {metadata.negative_prompt && (
            <div className="mt-2">
              <span className="text-[10px] text-gray-600 uppercase tracking-wider mb-1 block">Negative Prompt</span>
              <CopyableText text={metadata.negative_prompt} maxHeight={150} />
            </div>
          )}
        </div>
      </details>

      {/* Dimensions */}
      <details className="border-b border-[#2a4060]" open>
        <summary className="flex items-center gap-2 px-3 py-2 cursor-pointer text-gray-400 hover:text-white text-xs uppercase tracking-wider font-semibold">
          <ChevronIcon open />
          <span className="text-[#00b4d8]"><InfoIcon /></span>
          Dimensions
        </summary>
        <div className="px-3 pb-2 grid grid-cols-2 gap-2">
          <div className="bg-[#00b4d8]/10 border border-[#00b4d8]/20 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-[#00b4d8]">{metadata.width || '-'}</div>
            <div className="text-[10px] text-gray-600 uppercase">Width</div>
          </div>
          <div className="bg-[#00b4d8]/10 border border-[#00b4d8]/20 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-[#00b4d8]">{metadata.height || '-'}</div>
            <div className="text-[10px] text-gray-600 uppercase">Height</div>
          </div>
        </div>
      </details>

      {/* Tags */}
      {(metadata.tags?.length || metadata.original_user_tags?.length > 0) && (
        <details className="border-b border-[#2a4060]" open>
          <summary className="flex items-center gap-2 px-3 py-2 cursor-pointer text-gray-400 hover:text-white text-xs uppercase tracking-wider font-semibold">
            <ChevronIcon open />
            <span className="text-[#f0c832]"><InfoIcon /></span>
            Tags
          </summary>
          <div className="px-3 pb-2 flex flex-wrap gap-1.5">
            {metadata.tags?.map((tag, i) => (
              <span key={`tag-${tag}`} className={`rounded-full px-2.5 py-1 text-xs font-medium transition-all ${tagColors[i % tagColors.length]}`}>
                {tag}
              </span>
            ))}
            {metadata.original_user_tags?.map(tag => (
              <span key={`user-${tag}`} className="rounded-full px-2.5 py-1 text-xs font-medium transition-all bg-[#34d399]/20 text-[#34d399] hover:bg-[#34d399]/40">
                {tag}
              </span>
            ))}
          </div>
        </details>
      )}

      {/* Settings */}
      <details className="border-b border-[#2a4060]" open>
        <summary className="flex items-center gap-2 px-3 py-2 cursor-pointer text-gray-400 hover:text-white text-xs uppercase tracking-wider font-semibold">
          <ChevronIcon open />
          <span className="text-[#f97316]"><InfoIcon /></span>
          Settings
        </summary>
        <div className="px-3 pb-2">
          <MetaRow label="Steps" value={metadata.steps} />
          <MetaRow label="CFG" value={metadata.cfg} />
          <MetaRow label="Sampler" value={metadata.sampler} />
          <MetaRow label="Scheduler" value={metadata.scheduler} />
          <MetaRow label="Seed" value={metadata.seed} />
          <MetaRow label="Clip Skip" value={metadata.clip_skip} />
        </div>
      </details>

      {/* Model */}
      <details className="border-b border-[#2a4060]" open>
        <summary className="flex items-center gap-2 px-3 py-2 cursor-pointer text-gray-400 hover:text-white text-xs uppercase tracking-wider font-semibold">
          <ChevronIcon open />
          <span className="text-[#7b61ff]"><InfoIcon /></span>
          Model
        </summary>
        <div className="px-3 pb-2">
          {metadata.model && <MetaRow label="Checkpoint" value={metadata.model} />}
          {metadata.vae && <MetaRow label="VAE" value={metadata.vae} />}
          {metadata.loras?.length > 0 && (
            <MetaRow label="LoRAs" value={metadata.loras.map(l => `${l.name} (${l.weight})`).join(', ')} />
          )}
        </div>
      </details>

      {/* Error */}
      {metadata.error && (
        <div className="px-3 py-2 text-[10px] text-[#e94560] border-b border-[#2a4060]">
          Error: {metadata.error}
        </div>
      )}
    </div>
  )
}

function MetaRow({ label, value }) {
  if (value == null) return null
  const displayValue = String(value)
  if (!displayValue) return null
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-[#2a4060]/30 text-xs">
      <span className="text-gray-600">{label}</span>
      <span className="text-gray-300 font-mono truncate max-w-[180px] text-right" title={displayValue}>{displayValue}</span>
    </div>
  )
}
