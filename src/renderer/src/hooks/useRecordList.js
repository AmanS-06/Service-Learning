import { useCallback, useEffect, useRef, useState } from 'react'

// Loads a list from window.api[section] and re-runs the search when the query changes.
// section: 'beneficiaries' | 'production' | 'stallSales'
//
// Returns { rows, loading, error, query, setQuery, reload }
export default function useRecordList(section) {
  const [rows, setRows] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Ignore replies from older searches that arrive after a newer one.
  const latestRequest = useRef(0)

  const reload = useCallback(async () => {
    const requestId = ++latestRequest.current
    const api = window.api[section]
    try {
      const data = query ? await api.search(query) : await api.list()
      if (requestId !== latestRequest.current) return
      setRows(Array.isArray(data) ? data : [])
      setError('')
    } catch (err) {
      console.error(err)
      if (requestId !== latestRequest.current) return
      setError('Could not load records. Please restart the app if this keeps happening.')
    } finally {
      if (requestId === latestRequest.current) setLoading(false)
    }
  }, [section, query])

  useEffect(() => {
    reload()
  }, [reload])

  return { rows, loading, error, query, setQuery, reload }
}
