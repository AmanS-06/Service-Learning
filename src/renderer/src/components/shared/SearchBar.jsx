import { useState, useEffect, useRef } from 'react'
import Icon from './Icon'

// Search box with a short delay, so the list only reloads once typing pauses.
// onSearch is called with the trimmed text (or '' when cleared).
// Esc or the clear button empties the box.
export default function SearchBar({ placeholder, onSearch, delay = 300 }) {
  const [value, setValue] = useState('')
  const inputRef = useRef(null)

  // Keep the latest onSearch without restarting the timer when the parent re-renders.
  const onSearchRef = useRef(onSearch)
  onSearchRef.current = onSearch

  // Remember what was last sent, so the list isn't reloaded for no reason
  // (e.g. on first load, or when only spaces were typed).
  const lastSent = useRef('')

  useEffect(() => {
    const query = value.trim()
    if (query === lastSent.current) return

    const handle = setTimeout(() => {
      lastSent.current = query
      onSearchRef.current(query)
    }, delay)
    return () => clearTimeout(handle)
  }, [value, delay])

  const clear = () => {
    setValue('')
    inputRef.current?.focus()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && value) {
      e.preventDefault()
      clear()
    }
  }

  return (
    <div className="search">
      <Icon name="search" size={15} className="search-icon" />
      <input
        ref={inputRef}
        type="text"
        className="input"
        placeholder={placeholder || 'Search'}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        aria-label={placeholder || 'Search'}
        spellCheck={false}
      />
      {value && (
        <button
          type="button"
          className="btn btn-icon search-clear"
          onClick={clear}
          aria-label="Clear search"
          title="Clear"
        >
          <Icon name="x" size={14} />
        </button>
      )}
    </div>
  )
}
