import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, Clock, AlertCircle, TrendingUp } from 'lucide-react'
import { alertasAPI } from '../services/api'
import { formatPhone, formatRelativeTime, getStatusInfo, getPriorityColor, getPriorityLabel } from '../utils/formatters'
import LoadingSpinner from '../components/LoadingSpinner'

const Alertas = () => {
  const [alertas, setAlertas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterPriority, setFilterPriority] = useState('todos')

  useEffect(() => {
    const fetchAlertas = async () => {
      try {
        setLoading(true)
        const response = await alertasAPI.getAll()
        setAlertas(response.data.data)
      } catch (err) {
        setError('Erro ao carregar alertas')
        console.error('Alertas error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAlertas()
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchAlertas, 30000)
    return () => clearInterval(interval)
  }, [])

  const filteredAlertas = filterPriority === 'todos' 
    ? alertas 
    : alertas.filter(alerta => {
        if (filterPriority === 'alta') return alerta.prioridade >= 8
        if (filterPriority === 'media') return alerta.prioridade >= 5 && alerta.prioridade < 8
        if (filterPriority === 'baixa') return alerta.prioridade < 5
        return true
      })

  const alertasUrgentes = alertas.filter(a => a.prioridade >= 8)
  const alertasMedios = alertas.filter(a => a.prioridade >= 5 && a.prioridade < 8)
  const alertasBaixos = alertas.filter(a => a.prioridade < 5)

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
            Erro ao carregar alertas
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Alertas e Intervenções
          </h1>
          <p className="text-gray-600">
            Conversas que precisam de atenção ou intervenção humana
          </p>
        </div>
      </div>

      {/* Resumo de Alertas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-danger-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-danger-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Alta Prioridade</p>
              <p className="text-2xl font-bold text-gray-900">{alertasUrgentes.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-warning-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Média Prioridade</p>
              <p className="text-2xl font-bold text-gray-900">{alertasMedios.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-success-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Baixa Prioridade</p>
              <p className="text-2xl font-bold text-gray-900">{alertasBaixos.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-700">Filtrar por prioridade:</span>
        <div className="flex space-x-2">
          <button
            onClick={() => setFilterPriority('todos')}
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              filterPriority === 'todos'
                ? 'bg-primary-100 text-primary-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Todos ({alertas.length})
          </button>
          <button
            onClick={() => setFilterPriority('alta')}
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              filterPriority === 'alta'
                ? 'bg-danger-100 text-danger-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Alta ({alertasUrgentes.length})
          </button>
          <button
            onClick={() => setFilterPriority('media')}
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              filterPriority === 'media'
                ? 'bg-warning-100 text-warning-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Média ({alertasMedios.length})
          </button>
          <button
            onClick={() => setFilterPriority('baixa')}
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              filterPriority === 'baixa'
                ? 'bg-success-100 text-success-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Baixa ({alertasBaixos.length})
          </button>
        </div>
      </div>

      {/* Lista de Alertas */}
      {filteredAlertas.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum alerta encontrado
          </h3>
          <p className="text-gray-600">
            {filterPriority !== 'todos' 
              ? 'Não há alertas com a prioridade selecionada'
              : 'Todas as conversas estão funcionando normalmente'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAlertas.map((alerta) => {
            const statusInfo = getStatusInfo(alerta.status)
            const priorityColor = getPriorityColor(alerta.prioridade)
            const priorityLabel = getPriorityLabel(alerta.prioridade)
            
            return (
              <div 
                key={alerta.telefone}
                className="card hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">{statusInfo.icon}</span>
                        <span className={`text-xs font-medium ${statusInfo.className}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColor}`}>
                        {priorityLabel} ({alerta.prioridade}/10)
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {formatPhone(alerta.telefone)}
                    </h3>
                    
                    <p className="text-sm text-gray-600 mb-3">
                      {alerta.resumo}
                    </p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Mensagens:</span>
                        <span className="ml-1 font-medium">{alerta.totalMensagens}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Duração:</span>
                        <span className="ml-1 font-medium">{formatRelativeTime(alerta.ultimaInteracao)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Falhas:</span>
                        <span className="ml-1 font-medium">{alerta.falhas.length}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Última interação:</span>
                        <span className="ml-1 font-medium">{formatRelativeTime(alerta.ultimaInteracao)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4 flex flex-col space-y-2">
                    <Link
                      to={`/atendimentos/${alerta.telefone}`}
                      className="btn-primary text-sm"
                    >
                      Ver Conversa
                    </Link>
                  </div>
                </div>
                
                {/* Detalhes das Falhas */}
                {alerta.falhas.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Falhas Detectadas:
                    </h4>
                    <div className="space-y-1">
                      {alerta.falhas.slice(0, 3).map((falha, index) => (
                        <div key={index} className="flex items-center space-x-2 text-xs text-red-600">
                          <AlertTriangle className="w-3 h-3" />
                          <span>{falha.descricao}</span>
                        </div>
                      ))}
                      {alerta.falhas.length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{alerta.falhas.length - 3} mais falhas...
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Alertas 