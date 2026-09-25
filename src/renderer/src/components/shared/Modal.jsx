import { useEffect, useId, useRef } from 'react'

// Tracks open modals so that Esc only closes the one on top
// (e.g. a "Delete?" confirm opened over a detail view).
const openStack = []

// Shared pop-up window.
//
// isOpen:          show or hide
// onClose:         called on Esc, the Close button, or a click on the dark background
// title:           heading text
// footer:          buttons shown along the bottom (Cancel / Save etc.)
// maxWidth:        width limit in px
// closeOnBackdrop: set to false on forms so a stray click outside doesn't lose typed data
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = 620,
  closeOnBackdrop = true
}) {
  const id = useId()
  const titleId = `${id}-title`
  const dialogRef = useRef(null)

  // Keep the latest onClose without re-running the effect on every render.
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  // Only close on a backdrop click that also started on the backdrop,
  // so dragging to select text inside the form and releasing outside doesn't close it.
  const pressStartedOnBackdrop = useRef(false)

  useEffect(() => {
    if (!isOpen) return

    openStack.push(id)
    const previouslyFocused = document.activeElement

    // Move focus into the dialog unless a field inside already took it (autoFocus).
    if (dialogRef.current && !dialogRef.current.contains(document.activeElement)) {
      dialogRef.current.focus()
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && openStack[openStack.length - 1] === id) {
        e.stopPropagation()
        onCloseRef.current()
      }
    }
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      const index = openStack.lastIndexOf(id)
      if (index !== -1) openStack.splice(index, 1)
      // Return focus to whatever opened the dialog (e.g. the table row or button).
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        previouslyFocused.focus()
      }
    }
  }, [isOpen, id])

  if (!isOpen) return null

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        pressStartedOnBackdrop.current = e.target === e.currentTarget
      }}
      onClick={(e) => {
        if (closeOnBackdrop && pressStartedOnBackdrop.current && e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        ref={dialogRef}
        className="modal"
        style={{ maxWidth }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <div className="modal-header">
          <h2 id={titleId} className="modal-title">
            {title}
          </h2>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="modal-body">{children}</div>

        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  )
}
