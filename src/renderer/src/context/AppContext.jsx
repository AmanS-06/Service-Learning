import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'

// App-wide helpers:
//   toast(message, tone)  short message in the bottom-right corner ("Sale saved")
//   markChanged()         tell the sidebar counts and dashboard that records changed
//   dataVersion           number that goes up after every change (use it as an effect dependency)

const AppContext = createContext(null)
const TOAST_MS = 3000

export function AppProvider({ children }) {
  const [dataVersion, setDataVersion] = useState(0)
  const [toasts, setToasts] = useState([])
  const nextId = useRef(0)

  const markChanged = useCallback(() => setDataVersion((v) => v + 1), [])

  const toast = useCallback((message, tone = 'default') => {
    const id = ++nextId.current
    // Keep at most three on screen.
    setToasts((list) => [...list.slice(-2), { id, message, tone }])
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), TOAST_MS)
  }, [])

  const value = useMemo(
    () => ({ dataVersion, markChanged, toast }),
    [dataVersion, markChanged, toast]
  )

  return (
    <AppContext.Provider value={value}>
      {children}
      <div className="toast-region" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast${t.tone === 'error' ? ' is-error' : ''}`}>
            {t.message}
          </div>
        ))}
      </div>
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>')
  return ctx
}
