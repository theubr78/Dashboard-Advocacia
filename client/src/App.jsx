import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Atendimentos from './pages/Atendimentos'
import Conversa from './pages/Conversa'
import Alertas from './pages/Alertas'
import LoadingSpinner from './components/LoadingSpinner'

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    // Verificar conexão com o servidor
    const checkServerConnection = async () => {
      try {
        const response = await fetch('/api/health')
        if (response.ok) {
          setIsOnline(true)
        } else {
          setIsOnline(false)
        }
      } catch (error) {
        setIsOnline(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkServerConnection()
    
    // Verificar conexão periodicamente
    const interval = setInterval(checkServerConnection, 30000)
    
    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!isOnline) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🔌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Servidor Indisponível
          </h1>
          <p className="text-gray-600 mb-4">
            Não foi possível conectar ao servidor. Verifique se o backend está rodando.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-primary"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/atendimentos" element={<Atendimentos />} />
            <Route path="/atendimentos/:telefone" element={<Conversa />} />
            <Route path="/alertas" element={<Alertas />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App 