import Modal from '../shared/Modal'

export default function ProductionDetail({ entry, onClose, onEdit }) {
  if (!entry) return null

  const rows = [
    ['Type', entry.entry_type === 'MANUFACTURING' ? 'Manufacturing' : 'Sell'],
    ['Item', entry.item_name],
    ['Category', entry.category],
    ['Quantity', entry.quantity],
    ['Unit', entry.unit],
    ['Sold to', entry.sold_to],
    ['Recorded', entry.created_at]
  ]

  const footer = (
    <button onClick={() => onEdit(entry)} style={{
      padding: '10px 20px', background: '#2D6A35',
      color: 'white', border: 'none', borderRadius: 8,
      cursor: 'pointer', fontSize: 13, fontWeight: 600
    }}>
      Edit entry
    </button>
  )

  return (
    <Modal isOpen onClose={onClose} title="Entry detail" maxWidth={480} footer={footer}>
      {rows.map(([label, value]) => (
        <div key={label} style={{
          display: 'flex', justifyContent: 'space-between',
          padding: '9px 0', borderBottom: '1px solid #D6E0D7', fontSize: 13
        }}>
          <span style={{ color: '#8A9E8D', fontWeight: 600 }}>{label}</span>
          <span style={{ fontWeight: 500 }}>{value || '—'}</span>
        </div>
      ))}
    </Modal>
  )
}
