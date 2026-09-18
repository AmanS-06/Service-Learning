import { useState, useEffect } from 'react'

export default function SearchBar({ placeholder, onSearch, delay = 300 }) {
  const [value, setValue] = useState('')

  useEffect(() => {
    const handle = setTimeout(() => {
      onSearch(value)
    }, delay)
    return () => clearTimeout(handle)
  }, [value, delay, onSearch])

  return (
    <input
      type="text"
      className="app-search-bar"
      placeholder={placeholder || 'Search'}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  )
}