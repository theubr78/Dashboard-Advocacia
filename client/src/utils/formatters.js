import { format, formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export const formatPhone = (phone) => {
  if (!phone) return '-'
  
  // Remove @s.whatsapp.net se presente
  const cleanPhone = phone.replace('@s.whatsapp.net', '')
  
  // Formata como telefone brasileiro
  if (cleanPhone.length === 13 && cleanPhone.startsWith('55')) {
    const ddd = cleanPhone.substring(2, 4)
    const number = cleanPhone.substring(4)
    return `(${ddd}) ${number.substring(0, 5)}-${number.substring(5)}`
  }
  
  return cleanPhone
}

export const formatDate = (dateString) => {
  if (!dateString) return '-'
  
  try {
    const date = new Date(dateString)
    return format(date, 'dd/MM/yyyy HH:mm', { locale: ptBR })
  } catch (error) {
    return '-'
  }
}

export const formatRelativeTime = (dateString) => {
  if (!dateString) return '-'
  
  try {
    const date = new Date(dateString)
    return formatDistanceToNow(date, { 
      addSuffix: true, 
      locale: ptBR 
    })
  } catch (error) {
    return '-'
  }
}

export const formatDuration = (seconds) => {
  if (!seconds || seconds === 0) return '0s'
  
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`
  } else {
    return `${secs}s`
  }
}

export const getStatusInfo = (status) => {
  const statusMap = {
    sucesso: {
      label: 'Sucesso',
      className: 'status-success',
      icon: '✅'
    },
    falha: {
      label: 'Falha',
      className: 'status-failure',
      icon: '❌'
    },
    em_andamento: {
      label: 'Em Andamento',
      className: 'status-ongoing',
      icon: '⏳'
    },
    vazio: {
      label: 'Vazio',
      className: 'status-pending',
      icon: '📭'
    }
  }
  
  return statusMap[status] || statusMap.vazio
}

export const getPriorityColor = (priority) => {
  if (priority >= 8) return 'text-danger-600 bg-danger-50'
  if (priority >= 5) return 'text-warning-600 bg-warning-50'
  return 'text-success-600 bg-success-50'
}

export const getPriorityLabel = (priority) => {
  if (priority >= 8) return 'Alta'
  if (priority >= 5) return 'Média'
  return 'Baixa'
} 