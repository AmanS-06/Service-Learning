import { useState } from 'react'

export default function BeneficiaryDetail({ beneficiary, onEdit, onDeleted, onBack }) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    await window.api.beneficiaries.delete(beneficiary.id)
    setDeleting(false)
    onDeleted(beneficiary.id)
  }

  return (
    <div className="beneficiary-detail">
      <button onClick={onBack}>Back</button>
      <h2>{beneficiary.name}</h2>
      <dl>
        {Object.entries(beneficiary)
          .filter(([key]) => key !== 'id' && key !== 'created_at')
          .map(([key, value]) => (
            <div className="detail-row" key={key}>
              <dt>{key.replace(/_/g, ' ')}</dt>
              <dd>{value ?? ''}</dd>
            </div>
          ))}
      </dl>
      <div className="detail-actions">
        <button onClick={() => onEdit(beneficiary)}>Edit</button>
        <button onClick={handleDelete} disabled={deleting}>
          {deleting ? 'Deleting' : 'Delete'}
        </button>
      </div>
    </div>
  )
}