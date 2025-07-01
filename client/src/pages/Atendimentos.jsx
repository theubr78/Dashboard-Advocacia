import { useState, useEffect } from 'react'
import { Search, Filter, MessageSquare } from 'lucide-react'
import { atendimentosAPI } from '../services/api'
import { formatPhone, formatDate, formatDuration, getStatusInfo } from '../utils/formatters'
import LoadingSpinner from '../components/LoadingSpinner'

const Atendimentos = () => {
  const [atendimentos, setAtendimentos] = useState([])
  const [filteredAtendimentos, setFilteredAtendimentos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')

  useEffect(() => {
    const fetchAtendimentos = async () => {
      try {
        setLoading(true)
        const response = await atendimentosAPI.getAll()
        setAtendimentos(response.data.data)
        setFilteredAtendimentos(response.data.data)
      } catch (err) {
        setError('Erro ao carregar atendimentos')
        console.error('Atendimentos error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAtendimentos()
  }, [])

  useEffect(() => {
    let filtered = atendimentos

    // Filtrar por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(atendimento =>
        formatPhone(atendimento.telefone).toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtrar por status
    if (statusFilter !== 'todos') {
      filtered = filtered.filter(atendimento => atendimento.status === statusFilter)
    }

    setFilteredAtendimentos(filtered)
  }, [atendimentos, searchTerm, statusFilter])

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
            Erro ao carregar atendimentos
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
            Atendimentos
          </h1>
          <p className="text-gray-600">
            {filteredAtendimentos.length} de {atendimentos.length} atendimentos
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar por telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="todos">Todos os status</option>
            <option value="sucesso">Sucesso</option>
            <option value="falha">Falha</option>
            <option value="em_andamento">Em Andamento</option>
            <option value="vazio">Vazio</option>
          </select>
        </div>
      </div>

      {/* Lista de Atendimentos */}
      {filteredAtendimentos.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum atendimento encontrado
          </h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'todos' 
              ? 'Tente ajustar os filtros de busca'
              : 'Não há atendimentos registrados no sistema'
            }
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Telefone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mensagens
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duração
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Última Interação
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAtendimentos.map((atendimento) => {
                  const statusInfo = getStatusInfo(atendimento.status)
                  
                  return (
                    <tr key={atendimento.telefone} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatPhone(atendimento.telefone)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">{statusInfo.icon}</span>
                          <span className={`text-xs font-medium ${statusInfo.className}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {atendimento.totalMensagens}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDuration(atendimento.duracao)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(atendimento.ultimaInteracao)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <a
                          href={`/atendimentos/${atendimento.telefone}`}
                          className="text-primary-600 hover:text-primary-700"
                        >
                          Ver conversa
                        </a>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default Atendimentos 