import { Link } from 'react-router-dom'
import { formatPhone, formatRelativeTime, getStatusInfo } from '../utils/formatters'

const AtendimentosRecentes = ({ atendimentos }) => {
  if (!atendimentos || atendimentos.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Nenhum atendimento recente</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {atendimentos.map((atendimento) => {
        const statusInfo = getStatusInfo(atendimento.status)
        
        return (
          <div 
            key={atendimento.telefone}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="text-sm">{statusInfo.icon}</span>
                <span className={`text-xs font-medium ${statusInfo.className}`}>
                  {statusInfo.label}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-900 truncate">
                {formatPhone(atendimento.telefone)}
              </p>
              <p className="text-xs text-gray-500">
                {atendimento.totalMensagens} mensagens • {formatRelativeTime(atendimento.ultimaInteracao)}
              </p>
            </div>
            <Link
              to={`/atendimentos/${atendimento.telefone}`}
              className="ml-3 text-xs text-primary-600 hover:text-primary-700 font-medium"
            >
              Ver
            </Link>
          </div>
        )
      })}
    </div>
  )
}

export default AtendimentosRecentes 