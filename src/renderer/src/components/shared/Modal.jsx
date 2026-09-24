export default function Modal({ isOpen, onClose, title, children, footer, maxWidth = 620 }) {
  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(28,43,30,0.4)',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', zIndex: 100, padding: 20
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white', borderRadius: 16,
          width: '100%', maxWidth,
          maxHeight: '90vh', overflow: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          padding: '20px 28px 16px',
          borderBottom: '1px solid #D6E0D7',
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', position: 'sticky',
          top: 0, background: 'white'
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>{title}</h2>
          <button onClick={onClose} style={{
            background: 'none', border: 'none',
            fontSize: 20, cursor: 'pointer', color: '#8A9E8D'
          }}>✕</button>
        </div>

        <div style={{ padding: 28 }}>{children}</div>

        {footer && (
          <div style={{
            padding: '14px 28px 22px',
            borderTop: '1px solid #D6E0D7',
            display: 'flex', justifyContent: 'flex-end', gap: 10
          }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
