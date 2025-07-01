import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Clock, MessageSquare, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { atendimentosAPI } from '../services/api'
import { formatPhone, formatDate, formatDuration, getStatusInfo } from '../utils/formatters'
import LoadingSpinner from '../components/LoadingSpinner'

const Conversa = () => {
  const { telefone } = useParams()
  const [conversa, setConversa] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchConversa = async () => {
      try {
        setLoading(true)
        const response = await atendimentosAPI.getByPhone(telefone)
        setConversa(response.data.data)
      } catch (err) {
        setError('Erro ao carregar conversa')
        console.error('Conversa error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchConversa()
  }, [telefone])

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
            Erro ao carregar conversa
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

  if (!conversa) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="text-4xl mb-4">📭</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Conversa não encontrada
          </h2>
          <p className="text-gray-600">
            A conversa solicitada não foi encontrada no sistema.
          </p>
        </div>
      </div>
    )
  }

  const { mensagens, analise, duracaoFormatada } = conversa
  const statusInfo = getStatusInfo(analise.status)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link 
            to="/atendimentos"
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Conversa com {formatPhone(telefone)}
            </h1>
            <p className="text-gray-600">
              {analise.totalMensagens} mensagens • {duracaoFormatada}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm">{statusInfo.icon}</span>
          <span className={`text-sm font-medium ${statusInfo.className}`}>
            {statusInfo.label}
          </span>
        </div>
      </div>

      {/* Resumo da Conversa */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Mensagens</p>
              <p className="text-lg font-semibold text-gray-900">{analise.totalMensagens}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-success-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Mensagens IA</p>
              <p className="text-lg font-semibold text-gray-900">{analise.mensagensAI}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-warning-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Mensagens Humanas</p>
              <p className="text-lg font-semibold text-gray-900">{analise.mensagensHumanas}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-danger-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-danger-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Falhas Detectadas</p>
              <p className="text-lg font-semibold text-gray-900">{analise.falhas.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Falhas Detectadas */}
      {analise.falhas.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Falhas Detectadas
          </h3>
          <div className="space-y-2">
            {analise.falhas.map((falha, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-900">{falha.descricao}</p>
                  {falha.posicao >= 0 && (
                    <p className="text-xs text-red-700">
                      Posição na conversa: {falha.posicao + 1}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chat */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Conversa Completa
        </h3>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {mensagens.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhuma mensagem encontrada</p>
            </div>
          ) : (
            mensagens.map((mensagem, index) => (
              <div
                key={index}
                className={`flex ${mensagem.type === 'ai' ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    mensagem.type === 'ai'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-900'
                  } ${mensagem.isFalha ? 'border-2 border-red-500' : ''}`}
                >
                  <p className="text-sm">{mensagem.content}</p>
                  <p className={`text-xs mt-1 ${
                    mensagem.type === 'ai' ? 'text-primary-100' : 'text-gray-500'
                  }`}>
                    {formatDate(mensagem.timestamp)}
                  </p>
                  {mensagem.isFalha && (
                    <div className="mt-2 text-xs text-red-200">
                      ⚠️ Falha detectada nesta mensagem
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Resumo */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Resumo da Conversa
        </h3>
        <p className="text-gray-700">{analise.resumo}</p>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <strong>Primeira interação:</strong> {formatDate(analise.primeiraInteracao)}
          </div>
          <div>
            <strong>Última interação:</strong> {formatDate(analise.ultimaInteracao)}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Conversa 