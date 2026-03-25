import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Login from './pages/Login/login'
import Dashboard from './pages/Dashboard/dashboard'
import Transacciones from './pages/Transacciones/transacciones'
import Categorias from './pages/Categorias/categorias'
import Notas from './pages/Notas/notas'
import Presupuesto from './pages/Presupuesto/presupuesto'
import Reporte from './pages/Reporte/reporte'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/transacciones" element={<Transacciones />} />
        <Route path="/categorias" element={<Categorias />} />
        <Route path="/notas" element={<Notas />} />
        <Route path="/presupuestos" element={<Presupuesto />} />
        <Route path="/reportes" element={<Reporte />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

