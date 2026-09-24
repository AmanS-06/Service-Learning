import { useState, useEffect } from 'react'
import Table from '../shared/Table'
import SearchBar from '../shared/SearchBar'
import ProductionEntryForm from './ProductionEntryForm'
import ProductionDetail from './ProductionDetail'

const COLUMNS = [
  { key: 'entry_type', label: 'Type',
    render: (r) => (
      <span style={{
        fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20,
        background: r.entry_type === 'MANUFACTURING' ? '#EAF3EB' : '#FDF3E7',
        color: r.entry_type === 'MANUFACTURING' ? '#2D6A35' : '#B5720B'
      }}>
        {r.entry_type === 'MANUFACTURING' ? 'Manufacturing' : 'Sell'}
      </span>
    ) },
  { key: 'item_name', label: 'Item' },
  { key: 'category', label: 'Category' },
  { key: 'quantity', label: 'Qty' },
  { key: 'unit', label: 'Unit' },
  { key: 'sold_to', label: 'Sold To' }
]

export default function ProductionList() {
  const [rows, setRows] = useState([])
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [viewing, setViewing] = useState(null)

  async function load(q) {
    const data = q ? await window.api.production.search(q) : await window.api.production.list()
    setRows(data)
  }

  useEffect(() => { load(search) }, [search])

  function handleEdit(row) {
    setViewing(null)
    setEditing(row)
    setShowForm(true)
  }

  async function handleExport() {
    const csv = await window.api.production.export()
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = `production_log_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Production Log</h2>
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
            + Add entry
          </button>
        </div>
      </div>

      <SearchBar
        placeholder="Search by item, category, sold to…"
        onSearch={setSearch}
      />

      <div style={{
        background: 'white', borderRadius: 10,
        border: '1px solid #D6E0D7', overflow: 'hidden'
      }}>
        <Table columns={COLUMNS} rows={rows} onRowClick={setViewing} />
        <div style={{
          padding: '10px 16px', borderTop: '1px solid #D6E0D7',
          fontSize: 12, color: '#8A9E8D'
        }}>
          {rows.length} records
        </div>
      </div>

      {showForm && (
        <ProductionEntryForm
          initial={editing}
          onSave={() => { setShowForm(false); setEditing(null); load(search) }}
          onClose={() => { setShowForm(false); setEditing(null) }}
        />
      )}

      {viewing && (
        <ProductionDetail
          entry={viewing}
          onClose={() => setViewing(null)}
          onEdit={handleEdit}
        />
      )}
    </div>
  )
}
