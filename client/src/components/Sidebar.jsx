import { NavLink } from 'react-router-dom'
import { 
  BarChart3, 
  MessageSquare, 
  AlertTriangle, 
  Users,
  Scale
} from 'lucide-react'

const Sidebar = () => {
  const menuItems = [
    {
      path: '/',
      icon: BarChart3,
      label: 'Dashboard',
      description: 'Visão geral'
    },
    {
      path: '/atendimentos',
      icon: MessageSquare,
      label: 'Atendimentos',
      description: 'Todas as conversas'
    },
    {
      path: '/alertas',
      icon: AlertTriangle,
      label: 'Alertas',
      description: 'Intervenções necessárias'
    }
  ]

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
            <Scale className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Dashboard IA</h1>
            <p className="text-sm text-gray-500">Advocacia</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <div className="flex-1">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-gray-500">{item.description}</div>
                </div>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Desenvolvido para
          </p>
          <p className="text-sm font-medium text-gray-900">
            Leonardo Agapito
          </p>
        </div>
      </div>
    </div>
  )
}

export default Sidebar 