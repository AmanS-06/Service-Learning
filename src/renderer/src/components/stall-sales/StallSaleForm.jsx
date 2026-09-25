import { useEffect, useId, useState } from 'react'
import Modal from '../shared/Modal'
import FormInput from '../shared/FormInput'
import {
  cleanNumber,
  cleanText,
  formatCurrency,
  isValidPhone,
  todayISO,
  uniqueValues
} from '../../utils/format'

const EMPTY = {
  date: '',
  product_name: '',
  customer_name: '',
  rate: '',
  quantity: '',
  contact_no: '',
  stall_name: '',
  location: ''
}

export default function StallSaleForm({ initial, onSave, onClose }) {
  const isEdit = Boolean(initial?.id)
  const formId = useId()

  const [form, setForm] = useState(() =>
    initial ? { ...EMPTY, ...initial } : { ...EMPTY, date: todayISO() }
  )
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [suggestions, setSuggestions] = useState({})

  // Offer earlier products, stalls and locations while typing.
  useEffect(() => {
    let cancelled = false
    window.api.stallSales
      .list()
      .then((rows) => {
        if (cancelled) return
        setSuggestions({
          product_name: uniqueValues(rows, 'product_name'),
          stall_name: uniqueValues(rows, 'stall_name'),
          location: uniqueValues(rows, 'location')
        })
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const set = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  // Same calculation as the handler: amount = rate x quantity.
  const amount = (Number(form.rate) || 0) * (Number(form.quantity) || 0)

  function validate() {
    const found = {}
    if (!cleanText(form.product_name)) found.product_name = 'Enter the product name'

    const qty = Number(form.quantity)
    if (String(form.quantity ?? '').trim() === '') found.quantity = 'Enter the quantity'
    else if (!Number.isFinite(qty) || qty <= 0) found.quantity = 'Quantity must be more than 0'

    if (String(form.rate ?? '').trim() !== '') {
      const rate = Number(form.rate)
      if (!Number.isFinite(rate) || rate < 0) found.rate = 'Rate cannot be negative'
    }

    if (cleanText(form.contact_no) && !isValidPhone(form.contact_no)) {
      found.contact_no = 'Enter a valid phone number'
    }
    return found
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const found = validate()
    setErrors(found)
    if (Object.keys(found).length > 0) return

    // The handler uses named SQL parameters, so every field must be present (null when empty).
    const payload = {
      date: cleanText(form.date),
      product_name: cleanText(form.product_name),
      customer_name: cleanText(form.customer_name),
      rate: cleanNumber(form.rate),
      quantity: Number(form.quantity),
      contact_no: cleanText(form.contact_no),
      stall_name: cleanText(form.stall_name),
      location: cleanText(form.location)
    }

    setSaving(true)
    setSaveError('')
    try {
      if (isEdit) await window.api.stallSales.update(initial.id, payload)
      else await window.api.stallSales.create(payload)
      onSave()
    } catch (err) {
      console.error(err)
      setSaveError('Could not save this sale. Please try again.')
      setSaving(false)
    }
  }

  const footer = (
    <>
      <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
        Cancel
      </button>
      <button type="submit" form={formId} className="btn btn-primary" disabled={saving}>
        {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Save sale'}
      </button>
    </>
  )

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={isEdit ? 'Edit sale' : 'Add stall sale'}
      footer={footer}
      maxWidth={600}
      closeOnBackdrop={false}
    >
      <form id={formId} onSubmit={handleSubmit} noValidate>
        {saveError && <div className="alert alert-danger">{saveError}</div>}

        <div className="form-grid">
          <FormInput
            label="Date"
            type="date"
            value={form.date}
            onChange={(v) => set('date', v)}
          />
          <FormInput
            label="Product name"
            required
            autoFocus
            value={form.product_name}
            onChange={(v) => set('product_name', v)}
            error={errors.product_name}
            suggestions={suggestions.product_name}
          />
          <FormInput
            label="Rate (₹)"
            type="number"
            min="0"
            step="any"
            value={form.rate}
            onChange={(v) => set('rate', v)}
            error={errors.rate}
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
            label="Amount"
            full
            readOnly
            tabIndex={-1}
            value={formatCurrency(amount)}
            hint="Calculated as rate × quantity"
          />
          <FormInput
            label="Customer name"
            value={form.customer_name}
            onChange={(v) => set('customer_name', v)}
          />
          <FormInput
            label="Contact no."
            type="tel"
            value={form.contact_no}
            onChange={(v) => set('contact_no', v)}
            error={errors.contact_no}
          />
          <FormInput
            label="Stall name"
            value={form.stall_name}
            onChange={(v) => set('stall_name', v)}
            suggestions={suggestions.stall_name}
          />
          <FormInput
            label="Location"
            value={form.location}
            onChange={(v) => set('location', v)}
            suggestions={suggestions.location}
          />
        </div>
      </form>
    </Modal>
  )
}
