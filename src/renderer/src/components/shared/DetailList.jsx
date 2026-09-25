// Label / value rows used in the detail pop-ups.
// items: [[label, value], ...]  Empty values show as a dash.
export default function DetailList({ items }) {
  return (
    <dl className="detail-list">
      {items.map(([label, value]) => (
        <div className="detail-row" key={label}>
          <dt>{label}</dt>
          <dd>
            {value === null || value === undefined || value === '' ? (
              <span className="text-muted">-</span>
            ) : (
              value
            )}
          </dd>
        </div>
      ))}
    </dl>
  )
}
