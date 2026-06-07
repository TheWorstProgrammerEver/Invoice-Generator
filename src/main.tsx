import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { InvoiceGeneratorScreen } from './screens/InvoiceGeneratorScreen/InvoiceGeneratorScreen'
import { SandboxScreen } from './screens/SandboxScreen/SandboxScreen'
import './styles/global.scss'

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<InvoiceGeneratorScreen />} />
        <Route path="/sandbox" element={<SandboxScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
