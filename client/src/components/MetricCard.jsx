import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

const MetricCard = ({ title, value, icon: Icon, trend, color = 'primary' }) => {
  const colorClasses = {
    primary: {
      bg: 'bg-primary-50',
      icon: 'text-primary-600',
      value: 'text-primary-900'
    },
    success: {
      bg: 'bg-success-50',
      icon: 'text-success-600',
      value: 'text-success-900'
    },
    warning: {
      bg: 'bg-warning-50',
      icon: 'text-warning-600',
      value: 'text-warning-900'
    },
    danger: {
      bg: 'bg-danger-50',
      icon: 'text-danger-600',
      value: 'text-danger-900'
    }
  }

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-success-600" />
      case 'down':
        return <TrendingDown className="w-4 h-4 text-danger-600" />
      default:
        return <Minus className="w-4 h-4 text-gray-400" />
    }
  }

  const colors = colorClasses[color]

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${colors.value}`}>{value}</p>
        </div>
        <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${colors.icon}`} />
        </div>
      </div>
      <div className="mt-4 flex items-center">
        {getTrendIcon()}
        <span className="ml-2 text-sm text-gray-500">
          {trend === 'up' && 'Crescendo'}
          {trend === 'down' && 'Diminuindo'}
          {trend === 'neutral' && 'Estável'}
        </span>
      </div>
    </div>
  )
}

export default MetricCard 