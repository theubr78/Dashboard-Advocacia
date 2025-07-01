const express = require('express');
const redis = require('../config/redis');
const ConversaAnalyzer = require('../utils/conversaAnalyzer');
const { buscarChavesTelefone, buscarMensagensConversa } = require('../utils/redisHelpers');

const router = express.Router();

// GET /api/metricas - Retorna totais, sucesso/falha e dados para gráficos
router.get('/', async (req, res) => {
  try {
    const keys = await buscarChavesTelefone();
    const hoje = new Date();
    const inicioSemana = new Date(hoje.getTime() - (7 * 24 * 60 * 60 * 1000));
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    
    let totalAtendimentos = 0;
    let atendimentosHoje = 0;
    let atendimentosSemana = 0;
    let atendimentosMes = 0;
    let sucessos = 0;
    let falhas = 0;
    let emAndamento = 0;
    let dadosGrafico = {};
    
    // Inicializar dados do gráfico (últimos 7 dias)
    for (let i = 6; i >= 0; i--) {
      const data = new Date(hoje.getTime() - (i * 24 * 60 * 60 * 1000));
      const dataStr = data.toISOString().split('T')[0];
      dadosGrafico[dataStr] = {
        total: 0,
        sucessos: 0,
        falhas: 0,
        emAndamento: 0
      };
    }

    for (const key of keys) {
      try {
        const mensagens = await buscarMensagensConversa(key);
        if (mensagens.length > 0) {
          const analise = ConversaAnalyzer.analisarConversa(mensagens);
          
          totalAtendimentos++;
          
          // Verificar se é hoje
          if (analise.primeiraInteracao) {
            const dataPrimeira = new Date(analise.primeiraInteracao);
            const dataPrimeiraStr = dataPrimeira.toISOString().split('T')[0];
            const hojeStr = hoje.toISOString().split('T')[0];
            
            if (dataPrimeiraStr === hojeStr) {
              atendimentosHoje++;
            }
            
            if (dataPrimeira >= inicioSemana) {
              atendimentosSemana++;
            }
            
            if (dataPrimeira >= inicioMes) {
              atendimentosMes++;
            }
            
            // Adicionar ao gráfico
            if (dadosGrafico[dataPrimeiraStr]) {
              dadosGrafico[dataPrimeiraStr].total++;
              switch (analise.status) {
                case 'sucesso':
                  dadosGrafico[dataPrimeiraStr].sucessos++;
                  sucessos++;
                  break;
                case 'falha':
                  dadosGrafico[dataPrimeiraStr].falhas++;
                  falhas++;
                  break;
                case 'em_andamento':
                  dadosGrafico[dataPrimeiraStr].emAndamento++;
                  emAndamento++;
                  break;
              }
            }
          }
        }
      } catch (error) {
        console.error(`Erro ao processar conversa ${key}:`, error);
      }
    }

    // Calcular taxa de sucesso
    const totalConcluidos = sucessos + falhas;
    const taxaSucesso = totalConcluidos > 0 ? ((sucessos / totalConcluidos) * 100).toFixed(1) : 0;

    // Converter dados do gráfico para array
    const dadosGraficoArray = Object.entries(dadosGrafico).map(([data, valores]) => ({
      data,
      ...valores
    }));

    res.json({
      success: true,
      data: {
        totais: {
          total: totalAtendimentos,
          hoje: atendimentosHoje,
          semana: atendimentosSemana,
          mes: atendimentosMes
        },
        status: {
          sucessos,
          falhas,
          emAndamento,
          totalConcluidos
        },
        taxaSucesso: parseFloat(taxaSucesso),
        grafico: dadosGraficoArray
      }
    });

  } catch (error) {
    console.error('Erro ao buscar métricas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar métricas',
      message: error.message
    });
  }
});

// GET /api/metricas/detalhadas - Métricas mais detalhadas
router.get('/detalhadas', async (req, res) => {
  try {
    const keys = await buscarChavesTelefone();
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    
    let totalMensagens = 0;
    let mensagensAI = 0;
    let mensagensHumanas = 0;
    let tempoMedioConversa = 0;
    let conversasComFalhas = 0;
    let tiposFalhas = {};
    let horariosPico = {};
    
    const duracoes = [];

    for (const key of keys) {
      try {
        const mensagens = await buscarMensagensConversa(key);
        if (mensagens.length > 0) {
          const analise = ConversaAnalyzer.analisarConversa(mensagens);
          
          totalMensagens += analise.totalMensagens;
          mensagensAI += analise.mensagensAI;
          mensagensHumanas += analise.mensagensHumanas;
          
          if (analise.duracao > 0) {
            duracoes.push(analise.duracao);
          }
          
          if (analise.falhas.length > 0) {
            conversasComFalhas++;
            analise.falhas.forEach(falha => {
              tiposFalhas[falha.tipo] = (tiposFalhas[falha.tipo] || 0) + 1;
            });
          }
          
          // Análise de horários
          if (analise.primeiraInteracao) {
            const hora = new Date(analise.primeiraInteracao).getHours();
            horariosPico[hora] = (horariosPico[hora] || 0) + 1;
          }
        }
      } catch (error) {
        console.error(`Erro ao processar conversa ${key}:`, error);
        continue;
      }
    }

    // Calcular tempo médio
    if (duracoes.length > 0) {
      tempoMedioConversa = Math.floor(duracoes.reduce((a, b) => a + b, 0) / duracoes.length);
    }

    // Ordenar horários de pico
    const horariosPicoOrdenados = Object.entries(horariosPico)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([hora, quantidade]) => ({ hora: parseInt(hora), quantidade }));

    res.json({
      success: true,
      data: {
        mensagens: {
          total: totalMensagens,
          ai: mensagensAI,
          humanas: mensagensHumanas,
          proporcaoAI: totalMensagens > 0 ? ((mensagensAI / totalMensagens) * 100).toFixed(1) : 0
        },
        tempo: {
          medio: tempoMedioConversa,
          medioFormatado: ConversaAnalyzer.formatarDuracao(tempoMedioConversa)
        },
        falhas: {
          conversasComFalhas,
          tipos: tiposFalhas,
          percentual: keys.length > 0 ? ((conversasComFalhas / keys.length) * 100).toFixed(1) : 0
        },
        horariosPico: horariosPicoOrdenados
      }
    });

  } catch (error) {
    console.error('Erro ao buscar métricas detalhadas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar métricas detalhadas',
      message: error.message
    });
  }
});

module.exports = router; 