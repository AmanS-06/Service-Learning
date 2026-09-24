import { useState } from 'react'
import Modal from '../shared/Modal'
import FormInput from '../shared/FormInput'

const TYPES = ['MANUFACTURING', 'SELL']

export default function ProductionEntryForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || { entry_type: 'MANUFACTURING' })

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  async function submit() {
    if (!form.item_name || !form.quantity) {
      alert('Item name and quantity are required')
      return
    }
    if (initial?.id) await window.api.production.update(initial.id, form)
    else await window.api.production.create(form)
    onSave()
  }

  const footer = (
    <>
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
        {initial ? 'Save changes' : 'Save entry'}
      </button>
    </>
  )

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={initial ? 'Edit entry' : 'Add production entry'}
      footer={footer}
    >
      <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
        {TYPES.map((t) => (
          <button
            key={t}
            onClick={() => set('entry_type', t)}
            style={{
              flex: 1, padding: '9px 0', borderRadius: 8,
              border: form.entry_type === t ? '1.5px solid #2D6A35' : '1.5px solid #D6E0D7',
              background: form.entry_type === t ? '#EAF3EB' : 'white',
              color: form.entry_type === t ? '#2D6A35' : '#4A5E4D',
              fontWeight: 600, fontSize: 13, cursor: 'pointer'
            }}
          >
            {t === 'MANUFACTURING' ? 'Manufacturing' : 'Sell'}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14 }}>
        <FormInput label="Item name" required value={form.item_name} onChange={(v) => set('item_name', v)} />
        <FormInput label="Category" value={form.category} onChange={(v) => set('category', v)} />
        <FormInput label="Quantity" required type="number" value={form.quantity} onChange={(v) => set('quantity', v)} />
        <FormInput label="Unit" value={form.unit} onChange={(v) => set('unit', v)} />
        {form.entry_type === 'SELL' && (
          <FormInput label="Sold to" full value={form.sold_to} onChange={(v) => set('sold_to', v)} />
        )}
      </div>
    </Modal>
  )
}
