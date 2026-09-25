import Modal from './Modal'

// "Are you sure?" box shown inside the app (replaces the browser's confirm()).
// Cancel gets focus first, so pressing Enter by accident never deletes anything.
export default function ConfirmDialog({
  isOpen,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
  busy = false,
  error = ''
}) {
  const footer = (
    <>
      <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={busy} autoFocus>
        Cancel
      </button>
      <button type="button" className="btn btn-danger" onClick={onConfirm} disabled={busy}>
        {busy ? 'Deleting...' : confirmLabel}
      </button>
    </>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={busy ? () => {} : onCancel}
      title={title}
      footer={footer}
      maxWidth={420}
    >
      {error && <div className="alert alert-danger">{error}</div>}
      <p className="confirm-text">{message}</p>
    </Modal>
  )
}
