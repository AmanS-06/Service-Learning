import { useState } from 'react'
import Table from '../shared/Table'
import SearchBar from '../shared/SearchBar'
import ConfirmDialog from '../shared/ConfirmDialog'
import BeneficiaryForm from './BeneficiaryForm'
import BeneficiaryDetail from './BeneficiaryDetail'
import { BENEFICIARY_FIELDS } from './beneficiaryFields'
import useRecordList from '../../hooks/useRecordList'
import useShortcut from '../../hooks/useShortcut'
import { useApp } from '../../context/AppContext'
import { formatDate, formatNumber } from '../../utils/format'
import { downloadCsv, toCsv } from '../../utils/csv'

const COLUMNS = [
  { key: 'name', label: 'Name', render: (r) => <span className="strong">{r.name}</span> },
  { key: 'age', label: 'Age', numeric: true, render: (r) => formatNumber(r.age) },
  { key: 'sex', label: 'Sex' },
  { key: 'occupation', label: 'Occupation' },
  { key: 'contact_no', label: 'Contact no.' },
  { key: 'designation', label: 'Designation' },
  { key: 'joining_date', label: 'Joined', render: (r) => formatDate(r.joining_date) }
]

export default function BeneficiaryList() {
  const { rows, loading, error, query, setQuery, reload } = useRecordList('beneficiaries')
  const { toast, markChanged } = useApp()

  const [formRecord, setFormRecord] = useState(null) // null = closed, {} = new, row = edit
  const [viewing, setViewing] = useState(null)
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useShortcut('n', () => setFormRecord({}))

  function openEdit(row) {
    setViewing(null)
    setFormRecord(row)
  }

  function askDelete(row) {
    setDeleteError('')
    setToDelete(row)
  }

  function handleSaved() {
    const wasEdit = Boolean(formRecord?.id)
    setFormRecord(null)
    reload()
    markChanged()
    toast(wasEdit ? 'Changes saved' : 'Beneficiary added')
  }

  async function confirmDelete() {
    setDeleting(true)
    setDeleteError('')
    try {
      await window.api.beneficiaries.delete(toDelete.id)
      setToDelete(null)
      setViewing(null)
      reload()
      markChanged()
      toast('Beneficiary deleted')
    } catch (err) {
      console.error(err)
      setDeleteError('Could not delete this beneficiary. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  // The beneficiary export handler returns rows, so the CSV is built here
  // using the same labels as the Beneficiary Form.
  async function handleExport() {
    try {
      const data = await window.api.beneficiaries.export()
      const headers = ['ID', ...BENEFICIARY_FIELDS.map((f) => f.label), 'Created at']
      const lines = (data || []).map((r) => [
        r.id,
        ...BENEFICIARY_FIELDS.map((f) => r[f.key]),
        r.created_at
      ])
      downloadCsv(toCsv(headers, lines), 'beneficiaries')
    } catch (err) {
      console.error(err)
      toast('Could not export beneficiaries', 'error')
    }
  }

  const count = `${rows.length} ${rows.length === 1 ? 'beneficiary' : 'beneficiaries'}`

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Beneficiaries</h1>
          <p className="page-subtitle">People registered through the Beneficiary Form</p>
        </div>
        <div className="page-actions">
          <button type="button" className="btn btn-secondary" onClick={handleExport}>
            Export CSV
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setFormRecord({})}
            title="Shortcut: Ctrl+N"
            aria-keyshortcuts="Control+N"
          >
            Add beneficiary
          </button>
        </div>
      </div>

      <div className="toolbar">
        <SearchBar
          placeholder="Search by name, contact, occupation or designation"
          onSearch={setQuery}
        />
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="state">Loading beneficiaries...</div>
      ) : (
        <Table
          columns={COLUMNS}
          rows={rows}
          onRowClick={setViewing}
          onEdit={openEdit}
          onDelete={askDelete}
          emptyMessage={
            query
              ? 'No beneficiaries match your search.'
              : 'No beneficiaries yet. Use Add beneficiary to register someone.'
          }
          footer={<span>{query ? `${count} found` : count}</span>}
        />
      )}

      {formRecord && (
        <BeneficiaryForm
          initial={formRecord.id ? formRecord : null}
          onSave={handleSaved}
          onClose={() => setFormRecord(null)}
        />
      )}

      {viewing && (
        <BeneficiaryDetail
          beneficiary={viewing}
          onClose={() => setViewing(null)}
          onEdit={openEdit}
          onDelete={askDelete}
        />
      )}

      <ConfirmDialog
        isOpen={Boolean(toDelete)}
        title="Delete beneficiary"
        message={
          toDelete
            ? `Delete ${toDelete.name}'s record? All of their details will be removed. This cannot be undone.`
            : ''
        }
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
        busy={deleting}
        error={deleteError}
      />
    </div>
  )
}
