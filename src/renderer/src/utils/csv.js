import { todayISO } from './format'

// Builds CSV text from headers and rows (arrays of values).
// Used for beneficiaries, whose export handler returns rows rather than CSV.
export function toCsv(headers, rows) {
  const escape = (value) => {
    if (value === null || value === undefined) return ''
    const text = String(value)
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
  }
  return [headers, ...rows].map((row) => row.map(escape).join(',')).join('\r\n')
}

// Saves CSV text as a file. The leading BOM makes Excel read ₹ and Hindi text correctly.
export function downloadCsv(csv, prefix) {
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${prefix}_${todayISO()}.csv`
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
