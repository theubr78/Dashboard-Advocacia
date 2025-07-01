import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  MessageSquare,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { metricasAPI, atendimentosAPI } from '../services/api'
import { formatDate, getStatusInfo } from '../utils/formatters'
import LoadingSpinner from '../components/LoadingSpinner'
import MetricCard from '../components/MetricCard'
import ChartAtendimentos from '../components/ChartAtendimentos'
import AtendimentosRecentes from '../components/AtendimentosRecentes'

const Dashboard = () => {
  const [metricas, setMetricas] = useState(null)
  const [atendimentosRecentes, setAtendimentosRecentes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [metricasRes, atendimentosRes] = await Promise.all([
          metricasAPI.get(),
          atendimentosAPI.getAll()
        ])
        
        setMetricas(metricasRes.data.data)
        setAtendimentosRecentes(atendimentosRes.data.data.slice(0, 5))
      } catch (err) {
        setError('Erro ao carregar dados do dashboard')
        console.error('Dashboard error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    
    // Atualizar dados a cada 30 segundos
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Erro ao carregar dashboard
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
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

  if (!metricas) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="text-4xl mb-4">📊</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Nenhum dado disponível
          </h2>
          <p className="text-gray-600">
            Não há atendimentos registrados no sistema.
          </p>
        </div>
      </div>
    )
  }

  const { totais, status, taxaSucesso, grafico } = metricas

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard de Atendimentos
          </h1>
          <p className="text-gray-600">
            Visão geral do desempenho da IA de atendimento
          </p>
        </div>
        <div className="text-sm text-gray-500">
          Última atualização: {formatDate(new Date())}
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Atendimentos Hoje"
          value={totais.hoje}
          icon={Users}
          trend={totais.hoje > 0 ? 'up' : 'neutral'}
          color="primary"
        />
        <MetricCard
          title="Taxa de Sucesso"
          value={`${taxaSucesso}%`}
          icon={CheckCircle}
          trend={taxaSucesso >= 80 ? 'up' : 'down'}
          color="success"
        />
        <MetricCard
          title="Em Andamento"
          value={status.emAndamento}
          icon={Clock}
          trend="neutral"
          color="warning"
        />
        <MetricCard
          title="Falhas"
          value={status.falhas}
          icon={XCircle}
          trend={status.falhas > 0 ? 'down' : 'up'}
          color="danger"
        />
      </div>

      {/* Gráfico e Atendimentos Recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Atendimentos dos Últimos 7 Dias
              </h2>
            </div>
            <ChartAtendimentos data={grafico} />
          </div>
        </div>

        {/* Atendimentos Recentes */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Atendimentos Recentes
            </h2>
            <Link 
              to="/atendimentos" 
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              Ver todos
            </Link>
          </div>
          <AtendimentosRecentes atendimentos={atendimentosRecentes} />
        </div>
      </div>

      {/* Métricas Detalhadas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Esta Semana</h3>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {totais.semana}
          </div>
          <p className="text-sm text-gray-600">atendimentos</p>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-success-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Sucessos</h3>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {status.sucessos}
          </div>
          <p className="text-sm text-gray-600">atendimentos concluídos</p>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-danger-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-danger-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Total Geral</h3>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {totais.total}
          </div>
          <p className="text-sm text-gray-600">atendimentos registrados</p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard 