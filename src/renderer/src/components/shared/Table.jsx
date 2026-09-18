export default function Table({ columns, rows, onRowClick }) {
  return (
    <table className="app-table">
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.key}>{col.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && (
          <tr>
            <td colSpan={columns.length} className="app-table-empty">
              No records found
            </td>
          </tr>
        )}
        {rows.map((row) => (
          <tr
            key={row.id}
            className={onRowClick ? 'app-table-row-clickable' : ''}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
          >
            {columns.map((col) => (
              <td key={col.key}>{col.render ? col.render(row) : row[col.key]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}