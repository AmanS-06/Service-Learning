import { useEffect, useId, useState } from 'react'
import Modal from '../shared/Modal'
import FormInput from '../shared/FormInput'
import { cleanText, uniqueValues } from '../../utils/format'

const TYPES = [
  { value: 'MANUFACTURING', label: 'Manufacturing' },
  { value: 'SELL', label: 'Sell' }
]

const EMPTY = {
  entry_type: 'MANUFACTURING',
  item_name: '',
  category: '',
  quantity: '',
  unit: '',
  sold_to: ''
}

export default function ProductionEntryForm({ initial, onSave, onClose }) {
  const isEdit = Boolean(initial?.id)
  const formId = useId()

  const [form, setForm] = useState(() => ({ ...EMPTY, ...(initial || {}) }))
  const [dirty, setDirty] = useState(false) // true once anything is typed or changed
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [suggestions, setSuggestions] = useState({})

  // Offer names already in use, so "Jute bag" and "Jute Bag " don't become two stock items.
  useEffect(() => {
    let cancelled = false
    window.api.production
      .list()
      .then((rows) => {
        if (cancelled) return
        setSuggestions({
          item_name: uniqueValues(rows, 'item_name'),
          category: uniqueValues(rows, 'category'),
          unit: uniqueValues(rows, 'unit'),
          sold_to: uniqueValues(rows, 'sold_to')
        })
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const set = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }))
    setDirty(true)
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  function validate() {
    const found = {}
    if (!cleanText(form.item_name)) found.item_name = 'Enter the item name'
    const qty = Number(form.quantity)
    if (String(form.quantity ?? '').trim() === '') found.quantity = 'Enter the quantity'
    else if (!Number.isFinite(qty) || qty <= 0) found.quantity = 'Quantity must be more than 0'
    return found
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const found = validate()
    setErrors(found)
    if (Object.keys(found).length > 0) return

    const payload = {
      entry_type: form.entry_type,
      item_name: cleanText(form.item_name),
      category: cleanText(form.category),
      quantity: Number(form.quantity),
      unit: cleanText(form.unit),
      sold_to: form.entry_type === 'SELL' ? cleanText(form.sold_to) : null
    }

    setSaving(true)
    setSaveError('')
    try {
      if (isEdit) await window.api.production.update(initial.id, payload)
      else await window.api.production.create(payload)
      onSave()
    } catch (err) {
      console.error(err)
      setSaveError('Could not save this entry. Please try again.')
      setSaving(false)
    }
  }

  const footer = (
    <>
      <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
        Cancel
      </button>
      <button type="submit" form={formId} className="btn btn-primary" disabled={saving}>
        {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Save entry'}
      </button>
    </>
  )

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={isEdit ? 'Edit entry' : 'Add production entry'}
      footer={footer}
      maxWidth={560}
      closeOnBackdrop={false}
      closeOnEscape={!dirty}
    >
      <form id={formId} onSubmit={handleSubmit} noValidate>
        {saveError && <div className="alert alert-danger">{saveError}</div>}

        <div className="segmented" role="group" aria-label="Entry type">
          {TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              aria-pressed={form.entry_type === t.value}
              onClick={() => set('entry_type', t.value)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="form-grid">
          <FormInput
            label="Item name"
            required
            autoFocus
            value={form.item_name}
            onChange={(v) => set('item_name', v)}
            error={errors.item_name}
            suggestions={suggestions.item_name}
          />
          <FormInput
            label="Category"
            value={form.category}
            onChange={(v) => set('category', v)}
            suggestions={suggestions.category}
          />
          <FormInput
            label="Quantity"
            required
            type="number"
            min="0"
            step="any"
            value={form.quantity}
            onChange={(v) => set('quantity', v)}
            error={errors.quantity}
          />
          <FormInput
            label="Unit"
            placeholder="e.g. pcs, kg, m"
            value={form.unit}
            onChange={(v) => set('unit', v)}
            suggestions={suggestions.unit}
          />
          {form.entry_type === 'SELL' && (
            <FormInput
              label="Sold to"
              full
              value={form.sold_to}
              onChange={(v) => set('sold_to', v)}
              suggestions={suggestions.sold_to}
            />
          )}
        </div>
      </form>
    </Modal>
  )
}
