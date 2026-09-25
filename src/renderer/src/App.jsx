import { Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Sidebar from './components/shared/Sidebar'
import Dashboard from './components/dashboard/Dashboard'
import BeneficiaryList from './components/beneficiaries/BeneficiaryList'
import ProductionList from './components/production/ProductionList'
import StallSalesList from './components/stall-sales/StallSalesList'

export default function App() {
  return (
    <AppProvider>
      <div className="app">
        <Sidebar />
        <main className="main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/beneficiaries" element={<BeneficiaryList />} />
            <Route path="/production" element={<ProductionList />} />
            <Route path="/stall-sales" element={<StallSalesList />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </AppProvider>
  )
}
