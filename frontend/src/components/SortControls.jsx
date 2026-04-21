import { useMemo, useCallback, memo } from 'react'

const SortOptions = [
  { value: 'desc', label: 'Newest first' },
  { value: 'asc', label: 'Oldest first' },
  { value: 'name-asc', label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' },
  { value: 'width-desc', label: 'Width (largest)' },
  { value: 'width-asc', label: 'Width (smallest)' },
  { value: 'height-desc', label: 'Height (tallest)' },
  { value: 'height-asc', label: 'Height (shortest)' },
  { value: 'megapixels-desc', label: 'Megapixels (largest)' },
  { value: 'megapixels-asc', label: 'Megapixels (smallest)' },
]

function ChevronDownIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

const SortControls = memo(function SortControls({ sortKey, onSortChange }) {
  return (
    <div className="relative">
      <select
        value={sortKey}
        onChange={e => onSortChange(e.target.value)}
        className="custom-select bg-[#16213e] border border-[#2a4060] rounded-lg px-3 py-2 text-sm text-gray-300 cursor-pointer focus:outline-none focus:border-[#e94560] transition-colors max-w-[180px] min-w-[140px]"
      >
        {SortOptions.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <ChevronDownIcon />
    </div>
  )
})

export default SortControls
