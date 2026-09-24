import { useState, useEffect } from 'react'
import Table from '../shared/Table'
import SearchBar from '../shared/SearchBar'
import StallSaleForm from './StallSaleForm'

const COLUMNS = [
  { key: 'date',          label: 'Date' },
  { key: 'product_name',  label: 'Product' },
  { key: 'customer_name', label: 'Customer' },
  { key: 'rate',          label: 'Rate (₹)' },
  { key: 'quantity',      label: 'Qty' },
  { key: 'amount',        label: 'Amount (₹)',
    render: v => <strong style={{ color: '#2D6A35' }}>₹{v}</strong> },
  { key: 'stall_name',    label: 'Stall' },
  { key: 'location',      label: 'Location' },
]

export default function StallSalesList() {
  const [rows,     setRows]     = useState([])
  const [search,   setSearch]   = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing,  setEditing]  = useState(null)

  async function load(q) {
    const data = q
      ? await window.api.stallSales.search(q)
      : await window.api.stallSales.list()
    setRows(data)
  }

  useEffect(() => { load(search) }, [search])

  async function handleDelete(id) {
    if (!confirm('Delete this sale?')) return
    await window.api.stallSales.delete(id)
    load(search)
  }

  function handleEdit(row) {
    setEditing(row)
    setShowForm(true)
  }

  async function handleExport() {
    const csv = await window.api.stallSales.export()
    const a   = document.createElement('a')
    a.href     = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = `stall_sales_${new Date().toISOString().slice(0,10)}.csv`
    a.click()
  }

  const totalRevenue = rows.reduce((sum, r) => sum + (r.amount || 0), 0)

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Stall Sales</h2>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handleExport} style={{
            padding: '9px 18px', border: '1.5px solid #D6E0D7',
            borderRadius: 8, background: 'white',
            cursor: 'pointer', fontSize: 13, fontWeight: 600
          }}>
            Export CSV
          </button>
          <button onClick={() => { setEditing(null); setShowForm(true) }} style={{
            padding: '9px 18px', background: '#2D6A35', color: 'white',
            border: 'none', borderRadius: 8,
            cursor: 'pointer', fontSize: 13, fontWeight: 600
          }}>
            + Add sale
          </button>
        </div>
      </div>

      <SearchBar
        placeholder="Search by product, customer, stall…"
        onSearch={setSearch}
      />

      <div style={{
        background: 'white', borderRadius: 10,
        border: '1px solid #D6E0D7', overflow: 'hidden'
      }}>
        <Table columns={COLUMNS} rows={rows} onRowClick={handleEdit} />
        <div style={{
          padding: '10px 16px', borderTop: '1px solid #D6E0D7',
          display: 'flex', justifyContent: 'space-between',
          fontSize: 12, color: '#8A9E8D'
        }}>
          <span>{rows.length} records</span>
          <span>Total: ₹{totalRevenue.toLocaleString()}</span>
        </div>
      </div>

      {showForm && (
        <StallSaleForm
          initial={editing}
          onSave={() => { setShowForm(false); setEditing(null); load(search) }}
          onClose={() => { setShowForm(false); setEditing(null) }}
        />
      )}
    </div>
  )
}