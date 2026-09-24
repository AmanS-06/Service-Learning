import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/shared/Sidebar'
import Dashboard from './components/dashboard/Dashboard'
import BeneficiaryList from './components/beneficiaries/BeneficiaryList'
import ProductionList from './components/production/ProductionList'
import StallSalesList from './components/stall-sales/StallSalesList'

export default function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>

      {/* Topbar */}
      <div style={{
        background: '#2D6A35',
        color: 'white',
        height: 52,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>🌿</span>
          <span style={{ fontWeight: 700, fontSize: 15 }}>FieldLog Lite</span>
          <span style={{
            fontSize: 11,
            background: 'rgba(255,255,255,0.15)',
            padding: '2px 8px',
            borderRadius: 12,
            marginLeft: 4
          }}>
            Purnkuti NGO
          </span>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 12,
          opacity: 0.85
        }}>
          <span style={{
            width: 7, height: 7,
            borderRadius: '50%',
            background: '#5CB96A',
            display: 'inline-block'
          }} />
          Offline — no data leaves this machine
        </div>
      </div>

      {/* Body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar />
        <div style={{ flex: 1, overflowY: 'auto', background: '#F2F4F0' }}>
          <Routes>
            <Route path="/"                element={<Dashboard />} />
            <Route path="/beneficiaries"   element={<BeneficiaryList />} />
            <Route path="/production"      element={<ProductionList />} />
            <Route path="/stall-sales"     element={<StallSalesList />} />
          </Routes>
        </div>
      </div>

    </div>
  )
}