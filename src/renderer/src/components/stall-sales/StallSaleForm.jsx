import { useState } from 'react'

export default function StallSaleForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || {})

  const set = (k, v) => setForm(f => {
    const next = { ...f, [k]: v }
    next.amount = (Number(next.rate) || 0) * (Number(next.quantity) || 0)
    return next
  })

  async function submit() {
    if (!form.product_name || !form.quantity) {
      alert('Product name and quantity are required')
      return
    }
    if (initial?.id) await window.api.stallSales.update(initial.id, form)
    else             await window.api.stallSales.create(form)
    onSave()
  }

  const field = (label, key, type = 'text', readOnly = false) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#4A5E4D' }}>{label}</label>
      <input
        type={type}
        value={form[key] || ''}
        onChange={e => !readOnly && set(key, e.target.value)}
        readOnly={readOnly}
        style={{
          padding: '9px 12px', border: '1.5px solid #D6E0D7',
          borderRadius: 8, fontSize: 13, outline: 'none',
          background: readOnly ? '#F7FAF7' : '#F2F4F0',
          fontWeight: readOnly ? 700 : 400,
          color: readOnly ? '#2D6A35' : '#1C2B1E'
        }}
      />
    </div>
  )

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(28,43,30,0.4)',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 100, padding: 20
    }}>
      <div style={{
        background: 'white', borderRadius: 16,
        width: '100%', maxWidth: 620,
        maxHeight: '90vh', overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
      }}>
        <div style={{
          padding: '20px 28px 16px',
          borderBottom: '1px solid #D6E0D7',
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', position: 'sticky',
          top: 0, background: 'white'
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>
            {initial ? 'Edit sale' : 'Add stall sale'}
          </h2>
          <button onClick={onClose} style={{
            background: 'none', border: 'none',
            fontSize: 20, cursor: 'pointer', color: '#8A9E8D'
          }}>✕</button>
        </div>

        <div style={{ padding: 28 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14 }}>
            {field('Date',           'date',          'date')}
            {field('Product name *', 'product_name')}
            {field('Customer name',  'customer_name')}
            {field('Rate (₹)',       'rate',          'number')}
            {field('Quantity *',     'quantity',      'number')}
            {field('Amount (₹)',     'amount',        'number', true)}
            {field('Contact no.',    'contact_no')}
            {field('Stall name',     'stall_name')}
            <div style={{ gridColumn: '1/-1', display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#4A5E4D' }}>Location</label>
              <input
                value={form.location || ''}
                onChange={e => set('location', e.target.value)}
                style={{
                  padding: '9px 12px', border: '1.5px solid #D6E0D7',
                  borderRadius: 8, fontSize: 13, outline: 'none', background: '#F2F4F0'
                }}
              />
            </div>
          </div>
        </div>

        <div style={{
          padding: '14px 28px 22px',
          borderTop: '1px solid #D6E0D7',
          display: 'flex', justifyContent: 'flex-end', gap: 10
        }}>
          <button onClick={onClose} style={{
            padding: '10px 20px', border: '1.5px solid #D6E0D7',
            borderRadius: 8, background: 'white',
            cursor: 'pointer', fontSize: 13, fontWeight: 600
          }}>Cancel</button>
          <button onClick={submit} style={{
            padding: '10px 20px', background: '#2D6A35',
            color: 'white', border: 'none', borderRadius: 8,
            cursor: 'pointer', fontSize: 13, fontWeight: 600
          }}>
            {initial ? 'Save changes' : 'Save sale'}
          </button>
        </div>
      </div>
    </div>
  )
}