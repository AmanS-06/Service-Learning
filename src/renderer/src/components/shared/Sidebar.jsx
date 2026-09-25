import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { formatNumber } from '../../utils/format'

const LINKS = [
  { to: '/', label: 'Dashboard' },
  { to: '/beneficiaries', label: 'Beneficiaries' },
  { to: '/production', label: 'Production log' },
  { to: '/stall-sales', label: 'Stall sales' }
]

export default function Sidebar() {
  const { dataVersion } = useApp()
  const [counts, setCounts] = useState({})

  // Record totals beside each page name; reloaded whenever something is saved or deleted.
  useEffect(() => {
    let cancelled = false
    Promise.all([
      window.api.beneficiaries.list(),
      window.api.production.list(),
      window.api.stallSales.list()
    ])
      .then(([beneficiaries, production, sales]) => {
        if (cancelled) return
        setCounts({
          '/beneficiaries': beneficiaries.length,
          '/production': production.length,
          '/stall-sales': sales.length
        })
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [dataVersion])

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-name">FieldLog Lite</div>
        <div className="brand-org">Purnkuti NGO</div>
      </div>

      <nav className="nav" aria-label="Main">
        {LINKS.map((link) => (
          // NavLink adds the "active" class to the current page's link.
          <NavLink key={link.to} to={link.to} end={link.to === '/'} className="nav-link">
            <span>{link.label}</span>
            {counts[link.to] !== undefined && (
              <span className="nav-count">{formatNumber(counts[link.to])}</span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <span>Works offline. All data stays on this computer.</span>
        <span>Ctrl+N new record, Ctrl+F search</span>
      </div>
    </aside>
  )
}
