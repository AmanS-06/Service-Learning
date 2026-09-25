// Shared data table.
//
// columns: [{ key, label, render?(row), numeric?, width? }]
//   - render gets the whole row and returns what to show in the cell
//   - numeric right-aligns the column (quantities, amounts)
// rows:         array of records (each should have an id)
// onRowClick:   optional, called with the row when a row is clicked
// onEdit:       optional, shows an Edit button at the end of each row
// onDelete:     optional, shows a Delete button at the end of each row
// emptyMessage: text shown when there are no rows
// footer:       optional content for the strip under the table (counts, totals)
// bare:         no outer border, for tables placed inside a dashboard panel
export default function Table({
  columns,
  rows,
  onRowClick,
  onEdit,
  onDelete,
  emptyMessage = 'No records found',
  footer,
  bare = false
}) {
  const hasActions = Boolean(onEdit || onDelete)
  const colCount = columns.length + (hasActions ? 1 : 0)

  // Stops the row's own click (open details) from firing when a button is pressed.
  const handleAction = (fn, row) => (e) => {
    e.stopPropagation()
    fn(row)
  }

  const handleRowKey = (row) => (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onRowClick(row)
    }
  }

  return (
    <div className={`table-card${bare ? ' is-bare' : ''}`}>
      <div className="table-scroll">
        <table className="table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={col.numeric ? 'col-num' : undefined}
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.label}
                </th>
              ))}
              {hasActions && (
                <th className="col-actions">
                  <span className="sr-only">Actions</span>
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 && (
              <tr className="table-empty-row">
                <td colSpan={colCount} className="table-empty">
                  {emptyMessage}
                </td>
              </tr>
            )}

            {rows.map((row, index) => (
              <tr
                key={row.id ?? index}
                className={onRowClick ? 'is-clickable' : undefined}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                onKeyDown={onRowClick ? handleRowKey(row) : undefined}
                tabIndex={onRowClick ? 0 : undefined}
              >
                {columns.map((col) => {
                  const value = col.render ? col.render(row) : row[col.key]
                  return (
                    <td key={col.key} className={col.numeric ? 'col-num' : undefined}>
                      {value === null || value === undefined || value === '' ? (
                        <span className="text-muted">-</span>
                      ) : (
                        value
                      )}
                    </td>
                  )
                })}

                {hasActions && (
                  <td className="col-actions">
                    {onEdit && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={handleAction(onEdit, row)}
                      >
                        Edit
                      </button>
                    )}
                    {onDelete && (
                      <button
                        type="button"
                        className="btn btn-ghost-danger btn-sm"
                        onClick={handleAction(onDelete, row)}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {footer && <div className="table-footer">{footer}</div>}
    </div>
  )
}
