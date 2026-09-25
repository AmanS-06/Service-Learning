// Filter tabs shown above a list, e.g. All / Manufacturing / Sell.
// options: [{ value, label, count? }]
export default function Tabs({ options, value, onChange, label }) {
  return (
    <div className="tabs" role="group" aria-label={label}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className="tab"
          aria-pressed={value === opt.value}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
          {opt.count !== undefined && <span className="tab-count">{opt.count}</span>}
        </button>
      ))}
    </div>
  )
}
