import { useState, useRef, useEffect } from 'react'

const FilterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
)

const ClearIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
)

const FilterInput = ({ filterText, onFilterChange}) => {
  const inputRef = useRef(null)
  const [focused, setFocused] = useState(false)

  const clear = () => {
    onFilterChange('')
    inputRef.current?.focus()
  }

  // Debounced filter
  useEffect(() => {
    const timer = setTimeout(() => {
      // Parent handles debouncing via state
    }, 150)
    return () => clearTimeout(timer)
  }, [filterText])

  return (
    <div className={`flex items-center gap-2 bg-[#16213e] border rounded-lg px-3 py-2 transition-colors ${focused ? 'border-[#e94560]' : 'border-[#2a4060]'}`}>
      <span className="text-gray-500 flex-shrink-0"><FilterIcon /></span>
      <input
        ref={inputRef}
        type="text"
        value={filterText}
        onChange={e => onFilterChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Filter by tag, prompt, or filename..."
        spellCheck={false}
        className="flex-1 min-w-0 bg-transparent text-sm text-gray-200 placeholder-gray-600 focus:outline-none"
      />
      {filterText && (
        <button
          onClick={clear}
          className="text-gray-500 hover:text-red-400 cursor-pointer transition-colors"
          aria-label="Clear filter"
        >
          <ClearIcon />
        </button>
      )}
      {filterText && (
        <span className="text-xs text-[#e94560] flex-shrink-0">Active</span>
      )}
    </div>
  )
}

export default FilterInput
