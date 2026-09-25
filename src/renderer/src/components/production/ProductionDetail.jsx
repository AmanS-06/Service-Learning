import Modal from '../shared/Modal'
import DetailList from '../shared/DetailList'
import { formatDateTime, formatNumber } from '../../utils/format'

// Green for manufacturing, amber for sell. Also used in the list's Type column.
export function TypeBadge({ type }) {
  return type === 'SELL' ? (
    <span className="badge badge-warning">Sell</span>
  ) : (
    <span className="badge badge-success">Manufacturing</span>
  )
}

export default function ProductionDetail({ entry, onClose, onEdit, onDelete }) {
  if (!entry) return null

  const items = [
    ['Type', <TypeBadge key="type" type={entry.entry_type} />],
    ['Item', entry.item_name],
    ['Category', entry.category],
    ['Quantity', formatNumber(entry.quantity)],
    ['Unit', entry.unit],
    ...(entry.entry_type === 'SELL' ? [['Sold to', entry.sold_to]] : []),
    ['Recorded on', formatDateTime(entry.created_at)]
  ]

  const footer = (
    <>
      <button type="button" className="btn btn-ghost-danger spacer" onClick={() => onDelete(entry)}>
        Delete
      </button>
      <button type="button" className="btn btn-primary" onClick={() => onEdit(entry)}>
        Edit entry
      </button>
    </>
  )

  return (
    <Modal isOpen onClose={onClose} title="Entry details" maxWidth={500} footer={footer}>
      <DetailList items={items} />
    </Modal>
  )
}
