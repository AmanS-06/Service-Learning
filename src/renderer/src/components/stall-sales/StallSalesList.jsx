import { useState } from 'react'
import Table from '../shared/Table'
import SearchBar from '../shared/SearchBar'
import Tabs from '../shared/Tabs'
import ConfirmDialog from '../shared/ConfirmDialog'
import StallSaleForm from './StallSaleForm'
import StallSaleDetail from './StallSaleDetail'
import useRecordList from '../../hooks/useRecordList'
import useShortcut from '../../hooks/useShortcut'
import { useApp } from '../../context/AppContext'
import {
  formatCurrency,
  formatDate,
  formatNumber,
  toLocalISODate,
  todayISO
} from '../../utils/format'
import { downloadCsv } from '../../utils/csv'

const COLUMNS = [
  { key: 'date', label: 'Date', render: (r) => formatDate(r.date) },
  { key: 'product_name', label: 'Product', render: (r) => <span className="strong">{r.product_name}</span> },
  { key: 'customer_name', label: 'Customer' },
  { key: 'rate', label: 'Rate', numeric: true, render: (r) => formatCurrency(r.rate) },
  { key: 'quantity', label: 'Quantity', numeric: true, render: (r) => formatNumber(r.quantity) },
  {
    key: 'amount',
    label: 'Amount',
    numeric: true,
    render: (r) => <span className="strong">{formatCurrency(r.amount || 0)}</span>
  },
  { key: 'stall_name', label: 'Stall' },
  { key: 'location', label: 'Location' }
]

// The sale's own date, or the day it was recorded if no date was entered.
const saleDay = (sale) => sale.date || toLocalISODate(sale.created_at)

const PERIODS = [
  { value: 'all', label: 'All', match: () => true },
  { value: 'month', label: 'This month', match: (day) => day.slice(0, 7) === todayISO().slice(0, 7) },
  { value: 'today', label: 'Today', match: (day) => day === todayISO() }
]

export default function StallSalesList() {
  const { rows, loading, error, query, setQuery, reload } = useRecordList('stallSales')
  const { toast, markChanged } = useApp()

  const [period, setPeriod] = useState('all')
  const [formSale, setFormSale] = useState(null) // null = closed, {} = new, row = edit
  const [viewing, setViewing] = useState(null)
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useShortcut('n', () => setFormSale({}))

  function openEdit(row) {
    setViewing(null)
    setFormSale(row)
  }

  function askDelete(row) {
    setDeleteError('')
    setToDelete(row)
  }

  function handleSaved() {
    const wasEdit = Boolean(formSale?.id)
    setFormSale(null)
    // Show everything again so a new sale is never hidden by the current tab.
    if (!wasEdit) setPeriod('all')
    reload()
    markChanged()
    toast(wasEdit ? 'Changes saved' : 'Sale saved')
  }

  async function confirmDelete() {
    setDeleting(true)
    setDeleteError('')
    try {
      await window.api.stallSales.delete(toDelete.id)
      setToDelete(null)
      setViewing(null)
      reload()
      markChanged()
      toast('Sale deleted')
    } catch (err) {
      console.error(err)
      setDeleteError('Could not delete this sale. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  async function handleExport() {
    try {
      const csv = await window.api.stallSales.export()
      downloadCsv(csv, 'stall_sales')
    } catch (err) {
      console.error(err)
      toast('Could not export stall sales', 'error')
    }
  }

  const tabOptions = PERIODS.map((p) => ({
    value: p.value,
    label: p.label,
    count: rows.filter((r) => p.match(saleDay(r))).length
  }))
  const activePeriod = PERIODS.find((p) => p.value === period)
  const visible = rows.filter((r) => activePeriod.match(saleDay(r)))

  const total = visible.reduce((sum, r) => sum + (Number(r.amount) || 0), 0)
  const count = `${visible.length} ${visible.length === 1 ? 'sale' : 'sales'}`
  const filtered = Boolean(query) || period !== 'all'

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Stall sales</h1>
          <p className="page-subtitle">Retail transactions from stalls</p>
        </div>
        <div className="page-actions">
          <button type="button" className="btn btn-secondary" onClick={handleExport}>
            Export CSV
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setFormSale({})}
            title="Shortcut: Ctrl+N"
            aria-keyshortcuts="Control+N"
          >
            Add sale
          </button>
        </div>
      </div>

      <div className="toolbar">
        <SearchBar placeholder="Search by product, customer, stall or location" onSearch={setQuery} />
        <Tabs label="Period" options={tabOptions} value={period} onChange={setPeriod} />
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="state">Loading sales...</div>
      ) : (
        <Table
          columns={COLUMNS}
          rows={visible}
          onRowClick={setViewing}
          onEdit={openEdit}
          onDelete={askDelete}
          emptyMessage={filtered ? 'No sales match.' : 'No sales yet. Use Add sale to record one.'}
          footer={
            <>
              <span>{filtered ? `${count} shown` : count}</span>
              <span>
                Total <span className="strong num">{formatCurrency(total)}</span>
              </span>
            </>
          }
        />
      )}

      {formSale && (
        <StallSaleForm
          initial={formSale.id ? formSale : null}
          onSave={handleSaved}
          onClose={() => setFormSale(null)}
        />
      )}

      {viewing && (
        <StallSaleDetail
          sale={viewing}
          onClose={() => setViewing(null)}
          onEdit={openEdit}
          onDelete={askDelete}
        />
      )}

      <ConfirmDialog
        isOpen={Boolean(toDelete)}
        title="Delete sale"
        message={
          toDelete
            ? `Delete the sale of ${toDelete.product_name}${toDelete.date ? ` on ${formatDate(toDelete.date)}` : ''}? Revenue on the dashboard will be recalculated. This cannot be undone.`
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
