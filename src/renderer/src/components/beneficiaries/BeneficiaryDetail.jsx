import Modal from '../shared/Modal'
import DetailList from '../shared/DetailList'
import { BENEFICIARY_SECTIONS } from './beneficiaryFields'
import {
  describeIncomeChange,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatNumber
} from '../../utils/format'

function displayValue(field, value) {
  if (field.kind === 'money') return formatCurrency(value)
  if (field.kind === 'number') return formatNumber(value)
  if (field.kind === 'date') return formatDate(value)
  return value
}

// "Sunita Devi" -> "SD"
function initials(name) {
  return String(name || '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0] || '')
    .join('')
    .toUpperCase()
}

export default function BeneficiaryDetail({ beneficiary, onClose, onEdit, onDelete }) {
  if (!beneficiary) return null

  const role = [beneficiary.designation, beneficiary.occupation].filter(Boolean).join(', ')
  const joined = beneficiary.joining_date ? `Joined ${formatDate(beneficiary.joining_date)}` : ''
  const meta = [joined, beneficiary.contact_no].filter(Boolean).join('  |  ')
  const income = describeIncomeChange(beneficiary.income_before_lp, beneficiary.income_after_lp)

  const footer = (
    <>
      <button
        type="button"
        className="btn btn-ghost-danger spacer"
        onClick={() => onDelete(beneficiary)}
      >
        Delete
      </button>
      <button type="button" className="btn btn-primary" onClick={() => onEdit(beneficiary)}>
        Edit details
      </button>
    </>
  )

  return (
    <Modal isOpen onClose={onClose} title="Beneficiary details" maxWidth={680} footer={footer}>
      <div className="profile">
        <div className="avatar" aria-hidden="true">
          {initials(beneficiary.name)}
        </div>
        <div className="profile-main">
          <div className="profile-name">{beneficiary.name}</div>
          {role && <div className="profile-meta">{role}</div>}
          {meta && <div className="profile-meta">{meta}</div>}
        </div>
        {income && (
          <div className="profile-impact">
            <div className="stat-label">Monthly income</div>
            <div className="profile-impact-value">
              {formatCurrency(income.before)} <span className="stat-value-to">to</span>{' '}
              {formatCurrency(income.after)}
            </div>
            <div className="stat-sub">{income.text}</div>
          </div>
        )}
      </div>

      {BENEFICIARY_SECTIONS.map((section) => (
        <section className="detail-section" key={section.title}>
          <h3 className="form-section-title">{section.title}</h3>
          <DetailList
            items={section.fields.map((field) => [
              field.label,
              displayValue(field, beneficiary[field.key])
            ])}
          />
        </section>
      ))}

      <p className="field-hint" style={{ marginTop: 16 }}>
        Added on {formatDateTime(beneficiary.created_at) || 'unknown date'}
      </p>
    </Modal>
  )
}
