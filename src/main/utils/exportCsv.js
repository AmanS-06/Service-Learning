// headers: string[], rows: array of arrays (one array of values per row).
// Returns a CSV string; the renderer wraps it in a Blob and downloads it.
export function toCsv(headers, rows) {
  const escape = (val) => {
    if (val === null || val === undefined) return ''
    const str = String(val)
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str
  }

  const lines = [headers.map(escape).join(',')]
  for (const row of rows) {
    lines.push(row.map(escape).join(','))
  }
  return lines.join('\n')
}
