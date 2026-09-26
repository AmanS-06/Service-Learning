import { useId, useState } from 'react'
import Modal from '../shared/Modal'
import FormInput from '../shared/FormInput'
import { BENEFICIARY_FIELDS, BENEFICIARY_SECTIONS } from './beneficiaryFields'
import { cleanNumber, cleanText, isValidPhone } from '../../utils/format'

const EMPTY = Object.fromEntries(BENEFICIARY_FIELDS.map((f) => [f.key, '']))

export default function BeneficiaryForm({ initial, onSave, onClose }) {
  const isEdit = Boolean(initial?.id)
  const formId = useId()

  const [form, setForm] = useState(() => ({ ...EMPTY, ...(initial || {}) }))
  const [dirty, setDirty] = useState(false) // true once anything is typed or changed
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const set = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }))
    setDirty(true)
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  function validate() {
    const found = {}
    if (!cleanText(form.name)) found.name = 'Enter the name'

    for (const field of BENEFICIARY_FIELDS) {
      const raw = form[field.key]
      if (cleanText(raw) === null) continue

      if (field.kind === 'number' || field.kind === 'money') {
        const n = Number(raw)
        if (!Number.isFinite(n) || n < 0) found[field.key] = 'Enter a number of 0 or more'
      }
      if (field.kind === 'phone' && !isValidPhone(raw)) {
        found[field.key] = 'Enter a valid phone number'
      }
    }

    const age = Number(form.age)
    if (!found.age && cleanText(form.age) !== null && (age > 120 || !Number.isInteger(age))) {
      found.age = 'Enter a whole number up to 120'
    }
    return found
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const found = validate()
    setErrors(found)
    if (Object.keys(found).length > 0) {
      // Bring the first problem into view in this long form.
      const firstKey = BENEFICIARY_FIELDS.find((f) => found[f.key])?.key
      const firstInput = firstKey && document.querySelector(`[data-field="${firstKey}"] .input`)
      firstInput?.focus()
      return
    }

    // Every field is sent; empty ones become null so clearing a value on edit works.
    const payload = {}
    for (const field of BENEFICIARY_FIELDS) {
      const isNumeric = field.kind === 'number' || field.kind === 'money'
      payload[field.key] = isNumeric ? cleanNumber(form[field.key]) : cleanText(form[field.key])
    }

    setSaving(true)
    setSaveError('')
    try {
      if (isEdit) await window.api.beneficiaries.update(initial.id, payload)
      else await window.api.beneficiaries.create(payload)
      onSave()
    } catch (err) {
      console.error(err)
      setSaveError('Could not save this beneficiary. Please try again.')
      setSaving(false)
    }
  }

  const footer = (
    <>
      <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
        Cancel
      </button>
      <button type="submit" form={formId} className="btn btn-primary" disabled={saving}>
        {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Add beneficiary'}
      </button>
    </>
  )

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={isEdit ? `Edit ${initial.name || 'beneficiary'}` : 'Add beneficiary'}
      footer={footer}
      maxWidth={760}
      closeOnBackdrop={false}
      closeOnEscape={!dirty}
    >
      <form id={formId} onSubmit={handleSubmit} noValidate>
        {saveError && <div className="alert alert-danger">{saveError}</div>}

        {BENEFICIARY_SECTIONS.map((section) => (
          <section className="form-section" key={section.title}>
            <h3 className="form-section-title">{section.title}</h3>
            <div className="form-grid">
              {section.fields.map((field) => (
                // display: contents keeps the grid layout; the wrapper only tags the field
                // so the first invalid one can be focused.
                <div key={field.key} data-field={field.key} style={{ display: 'contents' }}>
                  <FormInput
                    label={field.label}
                    type={field.type || 'text'}
                    options={field.options}
                    required={field.required}
                    full={field.full}
                    placeholder={field.placeholder}
                    min={field.type === 'number' ? '0' : undefined}
                    step={field.kind === 'money' ? 'any' : undefined}
                    autoFocus={field.key === 'name'}
                    value={form[field.key]}
                    onChange={(v) => set(field.key, v)}
                    error={errors[field.key]}
                  />
                </div>
              ))}
            </div>
          </section>
        ))}
      </form>
    </Modal>
  )
}
