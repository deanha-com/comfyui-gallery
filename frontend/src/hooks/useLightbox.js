import { useState, useCallback, useRef, useEffect } from 'react'

export function useLightbox() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [direction, setDirection] = useState(0)
  const [panelOpen, setPanelOpen] = useState(true)
  const containerRef = useRef(null)

  const open = useCallback((index) => {
    setIsOpen(true)
    setCurrentIndex(index)
    setDirection(0)
    setPanelOpen(true)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
    setCurrentIndex(-1)
    setPanelOpen(false)
  }, [])

  const navigate = useCallback((dir) => {
    setDirection(dir)
    setCurrentIndex(prev => {
      // Circular navigation
      if (dir > 0) return (prev + 1)
      return Math.max(0, prev - 1)
    })
    setPanelOpen(false)
  }, [])

  const handleKeyDown = useCallback((e) => {
    if (!isOpen) return
    switch (e.key) {
      case 'Escape': close(); break
      case 'ArrowLeft': navigate(-1); break
      case 'ArrowRight': navigate(1); break
      case ' ': case 'ArrowDown':
        setPanelOpen(p => !p);
        e.preventDefault();
        break
    }
  }, [isOpen, close, navigate])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return { isOpen, currentIndex, direction, panelOpen, containerRef, open, close, navigate, setPanelOpen }
}
