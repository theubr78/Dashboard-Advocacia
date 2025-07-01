import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const ChartAtendimentos = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>Nenhum dado disponível para exibir</p>
      </div>
    )
  }

  // Formatar dados para o gráfico
  const chartData = data.map(item => ({
    data: new Date(item.data).toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit' 
    }),
    total: item.total,
    sucessos: item.sucessos,
    falhas: item.falhas,
    emAndamento: item.emAndamento
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="data" 
          tick={{ fontSize: 12 }}
        />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip 
          formatter={(value, name) => [
            value, 
            {
              'total': 'Total',
              'sucessos': 'Sucessos',
              'falhas': 'Falhas',
              'emAndamento': 'Em Andamento'
            }[name]
          ]}
          labelFormatter={(label) => `Data: ${label}`}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="total" 
          stroke="#3b82f6" 
          strokeWidth={2}
          name="Total"
        />
        <Line 
          type="monotone" 
          dataKey="sucessos" 
          stroke="#22c55e" 
          strokeWidth={2}
          name="Sucessos"
        />
        <Line 
          type="monotone" 
          dataKey="falhas" 
          stroke="#ef4444" 
          strokeWidth={2}
          name="Falhas"
        />
        <Line 
          type="monotone" 
          dataKey="emAndamento" 
          stroke="#f59e0b" 
          strokeWidth={2}
          name="Em Andamento"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export default ChartAtendimentos 