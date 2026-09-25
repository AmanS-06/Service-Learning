import Modal from '../shared/Modal'
import DetailList from '../shared/DetailList'
import { formatCurrency, formatDate, formatDateTime, formatNumber } from '../../utils/format'

export default function StallSaleDetail({ sale, onClose, onEdit, onDelete }) {
  if (!sale) return null

  const items = [
    ['Date', formatDate(sale.date)],
    ['Product', sale.product_name],
    ['Customer', sale.customer_name],
    ['Rate', formatCurrency(sale.rate)],
    ['Quantity', formatNumber(sale.quantity)],
    ['Amount', <span key="amount" className="strong">{formatCurrency(sale.amount || 0)}</span>],
    ['Contact no.', sale.contact_no],
    ['Stall', sale.stall_name],
    ['Location', sale.location],
    ['Recorded on', formatDateTime(sale.created_at)]
  ]

  const footer = (
    <>
      <button type="button" className="btn btn-ghost-danger spacer" onClick={() => onDelete(sale)}>
        Delete
      </button>
      <button type="button" className="btn btn-primary" onClick={() => onEdit(sale)}>
        Edit sale
      </button>
    </>
  )

  return (
    <Modal isOpen onClose={onClose} title="Sale details" maxWidth={500} footer={footer}>
      <DetailList items={items} />
    </Modal>
  )
}
