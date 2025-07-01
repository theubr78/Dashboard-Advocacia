# Dashboard IA - Advocacia

Dashboard completo para acompanhamento do desempenho da IA de atendimento via WhatsApp do advogado Leonardo Agapito.

## 🎯 Funcionalidades

### 📊 Dashboard Principal
- **Métricas em tempo real**: Total de atendimentos hoje, semana, mês
- **Taxa de sucesso da IA**: Percentual de atendimentos bem-sucedidos
- **Gráfico interativo**: Atendimentos dos últimos 7 dias
- **Atendimentos recentes**: Lista dos últimos 5 atendimentos com status

### 📂 Página de Atendimentos
- **Lista completa**: Todas as conversas com filtros por status
- **Busca por telefone**: Encontre atendimentos específicos
- **Informações detalhadas**: Telefone, status, mensagens, duração, última interação
- **Acesso direto**: Botão "Ver conversa" para cada atendimento

### 💬 Página da Conversa
- **Visual estilo chat**: Mensagens da IA em azul, humanas em cinza
- **Análise automática**: Detecção de falhas da IA
- **Resumo completo**: Duração, status, quantidade de mensagens
- **Falhas destacadas**: Mensagens com problemas são marcadas

### ⚠️ Página de Alertas
- **Priorização inteligente**: Alertas organizados por prioridade (1-10)
- **Filtros por urgência**: Alta, média e baixa prioridade
- **Detecção de falhas**: Loop da IA, repetições, demoras, sem resposta
- **Intervenção necessária**: Conversas que precisam de atenção humana

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** com Express
- **Redis** para armazenamento de dados
- **ioredis** para conexão com Redis
- **Helmet** e **CORS** para segurança

### Frontend
- **React 18** com Vite
- **React Router** para navegação
- **Tailwind CSS** para estilização
- **Recharts** para gráficos
- **Lucide React** para ícones
- **Axios** para requisições HTTP
- **date-fns** para formatação de datas

## 📁 Estrutura do Projeto

```
Dashboard/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── services/      # Serviços de API
│   │   └── utils/         # Utilitários
│   ├── package.json
│   └── vite.config.js
├── server/                # Backend Node.js
│   ├── src/
│   │   ├── config/        # Configurações
│   │   ├── routes/        # Rotas da API
│   │   └── utils/         # Utilitários
│   └── package.json
├── package.json           # Scripts principais
└── env.example           # Variáveis de ambiente
```

## 🚀 Instalação e Configuração

### Pré-requisitos
- Node.js 16+ 
- npm ou yarn
- Acesso ao Redis (URL fornecida)

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd Dashboard
```

### 2. Instale as dependências
```bash
# Instalar dependências do projeto principal
npm install

# Instalar dependências do servidor
cd server && npm install

# Instalar dependências do cliente
cd ../client && npm install

# Voltar para a raiz
cd ..
```

### 3. Configure as variáveis de ambiente
```bash
# Copie o arquivo de exemplo
cp env.example .env

# Edite o arquivo .env com suas configurações
# A URL do Redis já está configurada
```

### 4. Execute o projeto
```bash
# Desenvolvimento (ambos frontend e backend)
npm run dev

# Ou execute separadamente:
npm run server  # Backend na porta 3001
npm run client  # Frontend na porta 3000
```

## 🔧 Scripts Disponíveis

```bash
npm run dev          # Executa frontend e backend em desenvolvimento
npm run server       # Executa apenas o backend
npm run client       # Executa apenas o frontend
npm run build        # Build do frontend para produção
npm run install-all  # Instala todas as dependências
npm start           # Executa o servidor em produção
```

## 📡 API Endpoints

### Atendimentos
- `GET /api/atendimentos` - Lista todos os atendimentos
- `GET /api/atendimentos/:telefone` - Busca conversa específica
- `GET /api/atendimentos/status/:status` - Filtra por status

### Métricas
- `GET /api/metricas` - Métricas gerais e gráficos
- `GET /api/metricas/detalhadas` - Métricas avançadas

### Alertas
- `GET /api/alertas` - Lista de alertas
- `GET /api/alertas/urgentes` - Apenas alertas de alta prioridade
- `GET /api/alertas/tipos` - Estatísticas por tipo de falha

## 🔍 Análise de Conversas

O sistema analisa automaticamente as conversas para detectar:

### ✅ Sucessos
- Conversas concluídas sem falhas
- Resposta adequada da IA
- Fluxo natural de comunicação

### ❌ Falhas Detectadas
- **Loop da IA**: Muitas mensagens consecutivas da IA
- **Repetições**: IA repetindo a mesma mensagem
- **Sem resposta**: Conversa termina com mensagem da IA sem resposta
- **Demoras**: Muito tempo entre mensagens (>30 min)

### ⏳ Status de Conversas
- **Sucesso**: Atendimento concluído com sucesso
- **Falha**: Problemas detectados na conversa
- **Em Andamento**: Conversa ainda ativa
- **Vazio**: Conversa sem mensagens

## 🎨 Interface

### Design Responsivo
- Interface adaptada para desktop, tablet e mobile
- Navegação intuitiva com sidebar
- Cards informativos com métricas visuais
- Gráficos interativos

### Cores e Status
- **Azul**: Informações gerais e IA
- **Verde**: Sucessos e baixa prioridade
- **Amarelo**: Avisos e média prioridade
- **Vermelho**: Falhas e alta prioridade

## 🔒 Segurança

- **CORS** configurado para desenvolvimento
- **Helmet** para headers de segurança
- **Compression** para otimização
- **Validação** de dados de entrada
- **Tratamento de erros** robusto

### Estrutura dos Dados
- **Chaves**: Números de telefone com sufixo `@s.whatsapp.net`
- **Valores**: Array JSON de mensagens
- **Formato das mensagens**:
```json
{
  "type": "ai" | "human",
  "data": {
    "content": "conteúdo da mensagem"
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## 🚀 Deploy

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
# Build do frontend
npm run build

# Executar servidor
npm start
```

## 📝 Notas Importantes

- ✅ **Sem autenticação**: Sistema de acesso direto para o advogado
- ✅ **Dados reais**: Conecta diretamente ao Redis de produção
- ✅ **Tempo real**: Atualizações automáticas a cada 30 segundos
- ✅ **Análise inteligente**: Detecção automática de falhas
- ✅ **Interface moderna**: Design limpo e profissional

## 👨‍💼 Desenvolvido para

**Leonardo Agapito** - Advogado

Dashboard completo para acompanhamento do desempenho da IA de atendimento via WhatsApp, permitindo monitoramento em tempo real e identificação rápida de problemas que necessitam intervenção humana. 
