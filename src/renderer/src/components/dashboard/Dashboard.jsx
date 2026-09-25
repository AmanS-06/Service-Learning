import { useCallback, useEffect, useRef, useState } from 'react'
import Table from '../shared/Table'
import ProductionEntryForm from '../production/ProductionEntryForm'
import StallSaleForm from '../stall-sales/StallSaleForm'
import { useApp } from '../../context/AppContext'
import useShortcut from '../../hooks/useShortcut'
import {
  cleanNumber,
  daysAgoISO,
  describeIncomeChange,
  formatCurrency,
  formatDate,
  formatLongDate,
  formatNumber,
  formatRelative,
  parseDate,
  toLocalISODate,
  todayISO,
  weekdayShort
} from '../../utils/format'

// Totals come from the dashboard handler (same formulas as the Dashboard sheet).
// The extra panels are worked out here from the lists the app already loads.
const REFRESH_MS = 30000

const STATUS = {
  OK: { badge: 'badge-success', bar: '' },
  'Low Stock': { badge: 'badge-warning', bar: 'is-warning' },
  'Out of Stock': { badge: 'badge-danger', bar: 'is-danger' }
}

const STOCK_COLUMNS = [
  { key: 'item_name', label: 'Item', render: (r) => <span className="strong">{r.item_name}</span> },
  { key: 'manufactured', label: 'Manufactured', numeric: true, render: (r) => formatNumber(r.manufactured) },
  { key: 'sold', label: 'Sold', numeric: true, render: (r) => formatNumber(r.sold) },
  {
    key: 'stock_left',
    label: 'Stock left',
    render: (r) => {
      const pct = r.manufactured > 0 ? Math.max(0, Math.min(100, (r.stock_left / r.manufactured) * 100)) : 0
      return (
        <div className="stock-cell">
          <span className="stock-bar">
            <span
              className={`stock-bar-fill ${STATUS[r.status]?.bar || ''}`}
              style={{ width: `${pct}%` }}
            />
          </span>
          <span className="strong num">{formatNumber(r.stock_left)}</span>
        </div>
      )
    }
  },
  {
    key: 'status',
    label: 'Status',
    render: (r) => (
      <span className={`badge ${STATUS[r.status]?.badge || 'badge-neutral'}`}>{r.status}</span>
    )
  }
]

function greeting() {
  const hour = new Date().getHours()
  if (hour < 5) return 'Good evening'
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

// The sale's own date, or the day it was recorded if no date was entered.
const saleDay = (sale) => sale.date || toLocalISODate(sale.created_at)

// Average monthly income before and after LP, over people who have both figures.
function averageIncome(beneficiaries) {
  const both = beneficiaries.filter(
    (b) => cleanNumber(b.income_before_lp) !== null && cleanNumber(b.income_after_lp) !== null
  )
  if (both.length === 0) return null
  const avg = (key) => Math.round(both.reduce((sum, b) => sum + Number(b[key]), 0) / both.length)
  const change = describeIncomeChange(avg('income_before_lp'), avg('income_after_lp'))
  return { ...change, people: both.length }
}

function lastSevenDays(sales) {
  return [6, 5, 4, 3, 2, 1, 0].map((n) => {
    const iso = daysAgoISO(n)
    const total = sales
      .filter((s) => saleDay(s) === iso)
      .reduce((sum, s) => sum + (Number(s.amount) || 0), 0)
    return { iso, total }
  })
}

function recentActivity(beneficiaries, production, sales) {
  const qty = (p) => `${formatNumber(p.quantity)}${p.unit ? ` ${p.unit}` : ''}`
  const items = [
    ...production.map((p) => ({
      key: `p${p.id}`,
      at: p.created_at,
      badge: p.entry_type === 'SELL' ? ['Sell', 'badge-warning'] : ['Made', 'badge-success'],
      text:
        p.entry_type === 'SELL'
          ? `${p.item_name}, ${qty(p)}${p.sold_to ? ` to ${p.sold_to}` : ''}`
          : `${p.item_name}, ${qty(p)}`
    })),
    ...sales.map((s) => ({
      key: `s${s.id}`,
      at: s.created_at,
      badge: ['Sale', 'badge-info'],
      text: `${s.product_name}, ${formatCurrency(s.amount || 0)}${s.stall_name ? ` at ${s.stall_name}` : ''}`
    })),
    ...beneficiaries.map((b) => ({
      key: `b${b.id}`,
      at: b.created_at,
      badge: ['New', 'badge-neutral'],
      text: `${b.name} registered`
    }))
  ]
  return items
    .filter((item) => parseDate(item.at))
    .sort((a, b) => parseDate(b.at) - parseDate(a.at))
    .slice(0, 6)
}

function StatCard({ label, value, sub, tone }) {
  return (
    <div className="card stat">
      <div className="stat-label">{label}</div>
      <div className={`stat-value${tone ? ` is-${tone}` : ''}`}>{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  )
}

function SalesChart({ days }) {
  const max = Math.max(0, ...days.map((d) => d.total))
  const summary = days.map((d) => `${weekdayShort(d.iso)} ${formatCurrency(d.total)}`).join(', ')
  return (
    <div role="img" aria-label={`Sales for the last 7 days: ${summary}`}>
      <div className="chart-bars">
        {days.map((d, i) => (
          <div key={d.iso} className="chart-col" title={`${formatDate(d.iso)}: ${formatCurrency(d.total)}`}>
            <div
              className={`chart-bar${i === days.length - 1 ? ' is-today' : ''}${d.total === 0 ? ' is-empty' : ''}`}
              style={{ height: max > 0 && d.total > 0 ? `${Math.max(6, (d.total / max) * 100)}%` : undefined }}
            />
          </div>
        ))}
      </div>
      <div className="chart-labels">
        {days.map((d, i) => (
          <span key={d.iso} className={i === days.length - 1 ? 'is-today' : undefined}>
            {i === days.length - 1 ? 'Today' : weekdayShort(d.iso)}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { dataVersion, markChanged, toast } = useApp()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  const [openForm, setOpenForm] = useState(null) // null | 'sale' | 'entry'
  const mounted = useRef(true)

  const load = useCallback(async () => {
    try {
      const [summary, beneficiaries, production, sales] = await Promise.all([
        window.api.dashboard.summary(),
        window.api.beneficiaries.list(),
        window.api.production.list(),
        window.api.stallSales.list()
      ])
      if (!mounted.current) return
      setData({ summary, beneficiaries, production, sales })
      setFailed(false)
    } catch (err) {
      console.error(err)
      if (mounted.current) setFailed(true)
    } finally {
      if (mounted.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  // Reload when anything is saved or deleted, and every 30 s so "5 min ago" stays current.
  useEffect(() => {
    load()
  }, [load, dataVersion])

  useEffect(() => {
    const timer = setInterval(load, REFRESH_MS)
    return () => clearInterval(timer)
  }, [load])

  useShortcut('n', () => setOpenForm('sale'))

  function handleSaved(message) {
    setOpenForm(null)
    markChanged()
    toast(message)
  }

  if (loading) {
    return (
      <div className="page">
        <div className="state">Loading dashboard...</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="page">
        <div className="state state-error">
          Could not load the dashboard. Please restart the app. If it still fails, the database may
          not be set up.
        </div>
      </div>
    )
  }

  const { summary, beneficiaries, production, sales } = data
  const inventory = (summary.inventory || []).map((row) => ({ ...row, id: row.item_name }))
  const lowCount = inventory.filter((i) => i.status === 'Low Stock').length
  const outCount = inventory.filter((i) => i.status === 'Out of Stock').length
  const alertParts = [
    lowCount && `${lowCount} low`,
    outCount && `${outCount} out of stock`
  ].filter(Boolean)

  const income = averageIncome(beneficiaries)
  const days = lastSevenDays(sales)
  const weekTotal = days.reduce((sum, d) => sum + d.total, 0)
  const salesToday = sales.filter((s) => saleDay(s) === todayISO()).length
  const activity = recentActivity(beneficiaries, production, sales)

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{greeting()}</h1>
          <p className="page-subtitle">
            {formatLongDate()}
            {' | '}
            {salesToday === 0
              ? 'No sales recorded today yet'
              : `${salesToday} ${salesToday === 1 ? 'sale' : 'sales'} recorded today`}
          </p>
        </div>
        <div className="page-actions">
          <button type="button" className="btn btn-secondary" onClick={() => setOpenForm('entry')}>
            Add entry
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setOpenForm('sale')}
            title="Shortcut: Ctrl+N"
            aria-keyshortcuts="Control+N"
          >
            Record sale
          </button>
        </div>
      </div>

      {failed && (
        <div className="alert alert-danger">
          Could not refresh just now. Showing the last figures loaded.
        </div>
      )}

      <div className="stat-grid dashboard-stats">
        <StatCard
          label="Beneficiaries"
          value={formatNumber(summary.benTotal)}
          sub={`${formatNumber(summary.benMale)} male, ${formatNumber(summary.benFemale)} female`}
        />

        <div className="card stat is-highlight">
          <div className="stat-label">Avg. monthly income</div>
          {income ? (
            <>
              <div className="stat-value">
                {formatCurrency(income.before)} <span className="stat-value-to">to</span>{' '}
                {formatCurrency(income.after)}
              </div>
              <div className="stat-sub">
                {income.text}, {income.people} {income.people === 1 ? 'person' : 'people'}
              </div>
            </>
          ) : (
            <>
              <div className="stat-value">-</div>
              <div className="stat-sub">Shows once beneficiaries have income before and after LP</div>
            </>
          )}
        </div>

        <StatCard
          label="Stall revenue"
          value={formatCurrency(summary.stallRev || 0)}
          sub={weekTotal > 0 ? `+${formatCurrency(weekTotal)} last 7 days` : 'None in the last 7 days'}
        />

        <StatCard
          label="Stock alerts"
          value={lowCount + outCount}
          tone={outCount > 0 ? 'danger' : lowCount > 0 ? 'warning' : null}
          sub={alertParts.length ? alertParts.join(', ') : 'All items in stock'}
        />
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-header">
            <h2 className="panel-title">Live stock</h2>
            <span className="panel-meta">
              {inventory.length} {inventory.length === 1 ? 'item' : 'items'}
            </span>
          </div>
          <Table
            bare
            columns={STOCK_COLUMNS}
            rows={inventory}
            emptyMessage="No stock yet. Add manufacturing entries to see stock here."
          />
        </section>

        <div className="dashboard-side">
          <section className="panel">
            <div className="panel-header">
              <h2 className="panel-title">Sales, last 7 days</h2>
              <span className="panel-meta">{formatCurrency(weekTotal)}</span>
            </div>
            <div className="panel-body">
              <SalesChart days={days} />
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <h2 className="panel-title">Recent activity</h2>
            </div>
            {activity.length === 0 ? (
              <div className="panel-body text-muted">Nothing recorded yet.</div>
            ) : (
              <ul className="activity-list">
                {activity.map((item) => (
                  <li key={item.key} className="activity-item">
                    <span className={`badge ${item.badge[1]}`}>{item.badge[0]}</span>
                    <span className="activity-text" title={item.text}>
                      {item.text}
                    </span>
                    <span className="activity-time">{formatRelative(item.at)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      {openForm === 'sale' && (
        <StallSaleForm
          initial={null}
          onSave={() => handleSaved('Sale saved')}
          onClose={() => setOpenForm(null)}
        />
      )}
      {openForm === 'entry' && (
        <ProductionEntryForm
          initial={null}
          onSave={() => handleSaved('Entry added')}
          onClose={() => setOpenForm(null)}
        />
      )}
    </div>
  )
}
