export default function StallSaleDetail({ sale, onClose }) {
  if (!sale) return null

  const rows = [
    ['Date',        sale.date],
    ['Product',     sale.product_name],
    ['Customer',    sale.customer_name],
    ['Rate (₹)',    sale.rate],
    ['Quantity',    sale.quantity],
    ['Amount (₹)', sale.amount],
    ['Contact',     sale.contact_no],
    ['Stall',       sale.stall_name],
    ['Location',    sale.location],
  ]

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(28,43,30,0.4)',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 100, padding: 20
    }}>
      <div style={{
        background: 'white', borderRadius: 16,
        width: '100%', maxWidth: 480,
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
      }}>
        <div style={{
          padding: '20px 28px 16px',
          borderBottom: '1px solid #D6E0D7',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>Sale detail</h2>
          <button onClick={onClose} style={{
            background: 'none', border: 'none',
            fontSize: 20, cursor: 'pointer', color: '#8A9E8D'
          }}>✕</button>
        </div>

        <div style={{ padding: 28 }}>
          {rows.map(([label, value]) => (
            <div key={label} style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '9px 0', borderBottom: '1px solid #D6E0D7', fontSize: 13
            }}>
              <span style={{ color: '#8A9E8D', fontWeight: 600 }}>{label}</span>
              <span style={{ fontWeight: 500 }}>{value || '—'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}