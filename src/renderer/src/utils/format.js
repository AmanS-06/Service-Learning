// Display helpers shared by every screen, so dates, numbers and money look the same everywhere.

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/
const SQLITE_UTC = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/

const dateFormat = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric'
})

const dateTimeFormat = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})

const longDateFormat = new Intl.DateTimeFormat('en-IN', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric'
})

const weekdayFormat = new Intl.DateTimeFormat('en-IN', { weekday: 'short' })

// Accepts the date shapes the database holds (and Date objects):
//   '2026-09-25'            date picker value (treated as a local date)
//   '2026-09-25 10:30:00'   SQLite datetime('now'), stored in UTC
//   '2026-09-25T10:30:00Z'  JavaScript toISOString()
export function parseDate(value) {
  if (!value) return null
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value
  const text = String(value)
  if (DATE_ONLY.test(text)) {
    const [y, m, d] = text.split('-').map(Number)
    return new Date(y, m - 1, d)
  }
  if (SQLITE_UTC.test(text)) return new Date(text.replace(' ', 'T') + 'Z')
  const date = new Date(text)
  return Number.isNaN(date.getTime()) ? null : date
}

function isoFromDate(date) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

// 25 Sept 2026
export function formatDate(value) {
  const date = parseDate(value)
  return date ? dateFormat.format(date) : value || ''
}

// 25 Sept 2026, 04:00 pm
export function formatDateTime(value) {
  const date = parseDate(value)
  return date ? dateTimeFormat.format(date) : value || ''
}

// Saturday, 26 September 2026
export function formatLongDate(value = new Date()) {
  const date = parseDate(value)
  return date ? longDateFormat.format(date) : ''
}

// Sat
export function weekdayShort(value) {
  const date = parseDate(value)
  return date ? weekdayFormat.format(date) : ''
}

// Just now / 5 min ago / 3 h ago / Yesterday / 20 Sept 2026
export function formatRelative(value) {
  const date = parseDate(value)
  if (!date) return ''
  const minutes = Math.floor((Date.now() - date.getTime()) / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} min ago`
  const day = isoFromDate(date)
  if (day === todayISO()) return `${Math.floor(minutes / 60)} h ago`
  if (day === daysAgoISO(1)) return 'Yesterday'
  return formatDate(date)
}

// 1,00,000 (Indian grouping). Empty stays empty so tables can show a dash.
export function formatNumber(value) {
  if (value === null || value === undefined || value === '') return ''
  const n = Number(value)
  return Number.isFinite(n) ? n.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : String(value)
}

// ₹1,00,000
export function formatCurrency(value) {
  if (value === null || value === undefined || value === '') return ''
  const n = Number(value)
  if (!Number.isFinite(n)) return String(value)
  return '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 2 })
}

// Today's date as YYYY-MM-DD in local time (for date inputs, filters and file names).
export function todayISO() {
  return isoFromDate(new Date())
}

// The date n days ago as YYYY-MM-DD in local time.
export function daysAgoISO(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return isoFromDate(d)
}

// Any stored date or timestamp as a local YYYY-MM-DD ('' if it can't be read).
export function toLocalISODate(value) {
  const date = parseDate(value)
  return date ? isoFromDate(date) : ''
}

// Trimmed text, or null when empty (so blank fields are stored as empty, not as '').
export function cleanText(value) {
  const text = String(value ?? '').trim()
  return text === '' ? null : text
}

// Number from an input value, or null when empty.
export function cleanNumber(value) {
  if (value === null || value === undefined || String(value).trim() === '') return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

// Loose phone check: digits with optional +, spaces or dashes, 7 to 15 digits.
export function isValidPhone(value) {
  const text = String(value ?? '').trim()
  if (!/^\+?[\d\s-]+$/.test(text)) return false
  const digits = text.replace(/\D/g, '').length
  return digits >= 7 && digits <= 15
}

// Income before vs after joining LP, for one person or an average.
// Returns null unless both figures are present.
//   { before, after, text: '+150% after joining LP' }
export function describeIncomeChange(before, after) {
  const b = cleanNumber(before)
  const a = cleanNumber(after)
  if (b === null || a === null) return null
  let text
  if (b > 0) {
    const pct = Math.round(((a - b) / b) * 100)
    text = `${pct >= 0 ? '+' : ''}${pct}% after joining LP`
  } else {
    const diff = a - b
    text = `${diff >= 0 ? '+' : '-'}${formatCurrency(Math.abs(diff))} a month after joining LP`
  }
  return { before: b, after: a, text }
}

// Sorted list of distinct non-empty values in one column, for typing suggestions.
export function uniqueValues(rows, key) {
  const set = new Set()
  for (const row of rows || []) {
    const text = String(row[key] ?? '').trim()
    if (text) set.add(text)
  }
  return [...set].sort((a, b) => a.localeCompare(b))
}
