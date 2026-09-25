import { useEffect, useRef } from 'react'

// Runs handler on Ctrl+<key> (Cmd+<key> on Mac).
// Ignored while a pop-up is open, so Ctrl+N can't open a second form on top of one.
//   useShortcut('n', () => openNewForm())
export default function useShortcut(key, handler) {
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  useEffect(() => {
    const onKeyDown = (e) => {
      if (!(e.ctrlKey || e.metaKey) || e.altKey || e.shiftKey) return
      if (e.key.toLowerCase() !== key) return
      if (document.querySelector('.modal-backdrop')) return
      e.preventDefault()
      handlerRef.current(e)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [key])
}
