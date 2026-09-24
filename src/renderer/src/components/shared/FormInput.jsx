export default function FormInput({ label, value, onChange, type = 'text', required = false, readOnly = false, full = false }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 5,
      gridColumn: full ? '1/-1' : undefined
    }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#4A5E4D' }}>
        {label}{required && ' *'}
      </label>
      <input
        type={type}
        value={value ?? ''}
        onChange={(e) => !readOnly && onChange(e.target.value)}
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
}
