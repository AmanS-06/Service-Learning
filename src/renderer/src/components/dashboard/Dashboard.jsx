import { useState, useEffect } from 'react'

const STATUS_STYLE = {
  'OK':           { bg: '#EAF3EB', color: '#2D6A35', icon: '🟢' },
  'Low Stock':    { bg: '#FEF3C7', color: '#B45309', icon: '🟡' },
  'Out of Stock': { bg: '#FEE2E2', color: '#991B1B', icon: '🔴' },
}

export default function Dashboard() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    try {
      const summary = await window.api.dashboard.summary()
      setData(summary)
    } catch(e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const t = setInterval(load, 5000)
    return () => clearInterval(t)
  }, [])

  if (loading) return (
    <div style={{ padding: 32, color: '#8A9E8D', fontSize: 14 }}>
      Loading dashboard…
    </div>
  )

  if (!data) return (
    <div style={{ padding: 32, color: '#991B1B', fontSize: 14 }}>
      Could not load dashboard. Check that the database is set up.
    </div>
  )

  const statCard = (value, label, sub, borderColor) => (
    <div style={{
      background: 'white',
      border: '1px solid #D6E0D7',
      borderLeft: `4px solid ${borderColor}`,
      borderRadius: 10,
      padding: 20,
      boxShadow: '0 1px 4px rgba(28,43,30,0.08)'
    }}>
      <div style={{
        fontSize: 32, fontWeight: 800,
        letterSpacing: -1, color: borderColor
      }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: '#8A9E8D', marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 12, color: '#8A9E8D', marginTop: 2 }}>{sub}</div>}
    </div>
  )

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700 }}>Dashboard</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
        {statCard(data.benTotal, 'Beneficiaries',
          `${data.benMale} male · ${data.benFemale} female`, '#2D6A35')}
        {statCard(`₹${(data.stallRev||0).toLocaleString()}`, 'Total revenue',
          `${data.stallTx} transactions`, '#1D4ED8')}
        {statCard(
          data.inventory.filter(i => i.status === 'Low Stock').length,
          'Low stock items', null, '#B45309')}
        {statCard(
          data.inventory.filter(i => i.status === 'Out of Stock').length,
          'Out of stock', null, '#991B1B')}
      </div>

      <div>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Live stock</h3>
        <div style={{
          background: 'white', borderRadius: 10,
          border: '1px solid #D6E0D7', overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                {['Item','Manufactured','Sold','Stock Left','Status'].map(h => (
                  <th key={h} style={{
                    background: '#F7FAF7', padding: '10px 14px',
                    textAlign: 'left', borderBottom: '1px solid #D6E0D7',
                    color: '#4A5E4D', fontWeight: 600
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.inventory.length === 0 ? (
                <tr><td colSpan={5} style={{
                  padding: 40, textAlign: 'center', color: '#8A9E8D'
                }}>
                  No inventory yet — add manufacturing entries to see stock
                </td></tr>
              ) : data.inventory.map((row, i) => {
                const s = STATUS_STYLE[row.status]
                return (
                  <tr key={i} style={{ borderBottom: '1px solid #D6E0D7' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 600 }}>{row.item_name}</td>
                    <td style={{ padding: '10px 14px' }}>{row.manufactured}</td>
                    <td style={{ padding: '10px 14px' }}>{row.sold}</td>
                    <td style={{ padding: '10px 14px', fontWeight: 700 }}>{row.stock_left}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{
                        background: s.bg, color: s.color,
                        padding: '3px 10px', borderRadius: 20,
                        fontSize: 11, fontWeight: 700
                      }}>
                        {s.icon} {row.status}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}