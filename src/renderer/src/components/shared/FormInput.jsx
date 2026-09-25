import { useId } from 'react'

// Shared labelled form field.
//
// label, value, onChange(value)  - onChange receives the new value, not the event
// type:     'text' (default), 'number', 'date', 'tel', 'select' or 'textarea'
// options:  for type="select", e.g. ['Male', 'Female'] or [{ value: 'SELL', label: 'Sell' }]
// required: adds a red * after the label
// readOnly: shows a calculated value (e.g. Amount) that can't be typed into
// full:     field spans both columns of the form grid
// error:    message shown under the field in red
// hint:     small grey help text under the field
// Any other props (placeholder, autoFocus, min, step, maxLength...) go straight to the input.
export default function FormInput({
  label,
  value,
  onChange,
  type = 'text',
  options = [],
  required = false,
  readOnly = false,
  full = false,
  error,
  hint,
  ...rest
}) {
  const id = useId()
  const messageId = `${id}-message`
  const message = error || hint

  const common = {
    id,
    value: value ?? '',
    onChange: (e) => {
      if (!readOnly) onChange(e.target.value)
    },
    readOnly,
    required,
    className: `input${error ? ' has-error' : ''}`,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': message ? messageId : undefined,
    ...rest
  }

  let control
  if (type === 'select') {
    control = (
      <select {...common} disabled={readOnly}>
        <option value="">Select</option>
        {options.map((opt) => {
          const optValue = typeof opt === 'object' ? opt.value : opt
          const optLabel = typeof opt === 'object' ? opt.label : opt
          return (
            <option key={optValue} value={optValue}>
              {optLabel}
            </option>
          )
        })}
      </select>
    )
  } else if (type === 'textarea') {
    control = <textarea rows={3} {...common} />
  } else {
    control = (
      <input
        type={type}
        {...common}
        // Stop the mouse wheel from silently changing a number while scrolling the form.
        onWheel={type === 'number' ? (e) => e.currentTarget.blur() : undefined}
      />
    )
  }

  return (
    <div className={`field${full ? ' field-full' : ''}`}>
      <label htmlFor={id} className="field-label">
        {label}
        {required && <span className="field-required">*</span>}
      </label>
      {control}
      {message && (
        <span id={messageId} className={error ? 'field-error' : 'field-hint'}>
          {message}
        </span>
      )}
    </div>
  )
}
