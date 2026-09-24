import { useEffect, useState, useCallback } from 'react'
import Table from '../shared/Table.jsx'
import SearchBar from '../shared/SearchBar.jsx'

const COLUMNS = [
  { key: 'name', label: 'Name' },
  { key: 'age', label: 'Age' },
  { key: 'occupation', label: 'Occupation' },
  { key: 'contact_no', label: 'Contact No.' },
  { key: 'designation', label: 'Designation' }
]

export default function BeneficiaryList({ onSelect, onAddNew }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  const loadAll = useCallback(async () => {
    setLoading(true)
    const data = await window.api.beneficiaries.list()
    setRows(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const handleSearch = useCallback(async (query) => {
    if (!query) {
      loadAll()
      return
    }
    const data = await window.api.beneficiaries.search(query)
    setRows(data)
  }, [loadAll])

  return (
    <div className="beneficiary-list">
      <div className="beneficiary-list-header">
        <SearchBar placeholder="Search by name, contact, occupation" onSearch={handleSearch} />
        <button onClick={onAddNew}>Add Beneficiary</button>
      </div>
      {loading ? (
        <p>Loading</p>
      ) : (
        <Table columns={COLUMNS} rows={rows} onRowClick={onSelect} />
      )}
    </div>
  )
}