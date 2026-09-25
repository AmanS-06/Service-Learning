import { useState } from 'react'
import Table from '../shared/Table'
import SearchBar from '../shared/SearchBar'
import Tabs from '../shared/Tabs'
import ConfirmDialog from '../shared/ConfirmDialog'
import ProductionEntryForm from './ProductionEntryForm'
import ProductionDetail, { TypeBadge } from './ProductionDetail'
import useRecordList from '../../hooks/useRecordList'
import useShortcut from '../../hooks/useShortcut'
import { useApp } from '../../context/AppContext'
import { formatDate, formatNumber } from '../../utils/format'
import { downloadCsv } from '../../utils/csv'

const COLUMNS = [
  { key: 'entry_type', label: 'Type', render: (r) => <TypeBadge type={r.entry_type} /> },
  { key: 'item_name', label: 'Item', render: (r) => <span className="strong">{r.item_name}</span> },
  { key: 'category', label: 'Category' },
  { key: 'quantity', label: 'Quantity', numeric: true, render: (r) => formatNumber(r.quantity) },
  { key: 'unit', label: 'Unit' },
  { key: 'sold_to', label: 'Sold to' },
  { key: 'created_at', label: 'Recorded on', render: (r) => formatDate(r.created_at) }
]

const TYPE_FILTERS = [
  { value: 'ALL', label: 'All' },
  { value: 'MANUFACTURING', label: 'Manufacturing' },
  { value: 'SELL', label: 'Sell' }
]

export default function ProductionList() {
  const { rows, loading, error, query, setQuery, reload } = useRecordList('production')
  const { toast, markChanged } = useApp()

  const [typeFilter, setTypeFilter] = useState('ALL')
  const [formEntry, setFormEntry] = useState(null) // null = closed, {} = new, row = edit
  const [viewing, setViewing] = useState(null)
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useShortcut('n', () => setFormEntry({}))

  function openEdit(row) {
    setViewing(null)
    setFormEntry(row)
  }

  function askDelete(row) {
    setDeleteError('')
    setToDelete(row)
  }

  function handleSaved() {
    const wasEdit = Boolean(formEntry?.id)
    setFormEntry(null)
    // Show everything again so a new entry is never hidden by the current tab.
    if (!wasEdit) setTypeFilter('ALL')
    reload()
    markChanged()
    toast(wasEdit ? 'Changes saved' : 'Entry added')
  }

  async function confirmDelete() {
    setDeleting(true)
    setDeleteError('')
    try {
      await window.api.production.delete(toDelete.id)
      setToDelete(null)
      setViewing(null)
      reload()
      markChanged()
      toast('Entry deleted')
    } catch (err) {
      console.error(err)
      setDeleteError('Could not delete this entry. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  async function handleExport() {
    try {
      const csv = await window.api.production.export()
      downloadCsv(csv, 'production_log')
    } catch (err) {
      console.error(err)
      toast('Could not export the production log', 'error')
    }
  }

  const visible = typeFilter === 'ALL' ? rows : rows.filter((r) => r.entry_type === typeFilter)
  const tabOptions = TYPE_FILTERS.map((f) => ({
    ...f,
    count: f.value === 'ALL' ? rows.length : rows.filter((r) => r.entry_type === f.value).length
  }))

  const count = `${visible.length} ${visible.length === 1 ? 'entry' : 'entries'}`
  const filtered = Boolean(query) || typeFilter !== 'ALL'

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Production log</h1>
          <p className="page-subtitle">Manufacturing and wholesale sell entries</p>
        </div>
        <div className="page-actions">
          <button type="button" className="btn btn-secondary" onClick={handleExport}>
            Export CSV
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setFormEntry({})}
            title="Shortcut: Ctrl+N"
            aria-keyshortcuts="Control+N"
          >
            Add entry
          </button>
        </div>
      </div>

      <div className="toolbar">
        <SearchBar placeholder="Search by item, category, type or buyer" onSearch={setQuery} />
        <Tabs label="Entry type" options={tabOptions} value={typeFilter} onChange={setTypeFilter} />
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="state">Loading entries...</div>
      ) : (
        <Table
          columns={COLUMNS}
          rows={visible}
          onRowClick={setViewing}
          onEdit={openEdit}
          onDelete={askDelete}
          emptyMessage={
            filtered
              ? 'No entries match.'
              : 'No entries yet. Use Add entry to record manufacturing or a sale.'
          }
          footer={<span>{filtered ? `${count} shown` : count}</span>}
        />
      )}

      {formEntry && (
        <ProductionEntryForm
          initial={formEntry.id ? formEntry : null}
          onSave={handleSaved}
          onClose={() => setFormEntry(null)}
        />
      )}

      {viewing && (
        <ProductionDetail
          entry={viewing}
          onClose={() => setViewing(null)}
          onEdit={openEdit}
          onDelete={askDelete}
        />
      )}

      <ConfirmDialog
        isOpen={Boolean(toDelete)}
        title="Delete entry"
        message={
          toDelete
            ? `Delete this ${toDelete.entry_type === 'SELL' ? 'sell' : 'manufacturing'} entry for ${toDelete.item_name}? Stock on the dashboard will be recalculated. This cannot be undone.`
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
