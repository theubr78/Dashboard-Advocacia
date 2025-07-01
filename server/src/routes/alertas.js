const express = require('express');
const redis = require('../config/redis');
const ConversaAnalyzer = require('../utils/conversaAnalyzer');
const { buscarChavesTelefone, extrairTelefone, buscarMensagensConversa } = require('../utils/redisHelpers');

const router = express.Router();

// GET /api/alertas - Lista de atendimentos com falhas
router.get('/', async (req, res) => {
  try {
    const keys = await buscarChavesTelefone();
    const alertas = [];

    for (const key of keys) {
      try {
        const mensagens = await buscarMensagensConversa(key);
        if (mensagens.length > 0) {
          const analise = ConversaAnalyzer.analisarConversa(mensagens);
          
          // Incluir apenas conversas com falhas ou que precisam de intervenção
          if (analise.falhas.length > 0 || analise.status === 'em_andamento') {
            const telefone = extrairTelefone(key);
            
            alertas.push({
              telefone,
              primeiraInteracao: analise.primeiraInteracao,
              ultimaInteracao: analise.ultimaInteracao,
              totalMensagens: analise.totalMensagens,
              status: analise.status,
              duracao: analise.duracao,
              mensagensAI: analise.mensagensAI,
              mensagensHumanas: analise.mensagensHumanas,
              falhas: analise.falhas,
              resumo: analise.resumo,
              prioridade: this.calcularPrioridade(analise),
              tempoDesdeUltimaInteracao: this.calcularTempoDesdeUltimaInteracao(analise.ultimaInteracao)
            });
          }
        }
      } catch (error) {
        console.error(`Erro ao processar conversa ${key}:`, error);
        continue;
      }
    }

    // Ordenar por prioridade (mais alta primeiro) e depois por tempo
    alertas.sort((a, b) => {
      if (a.prioridade !== b.prioridade) {
        return b.prioridade - a.prioridade;
      }
      return a.tempoDesdeUltimaInteracao - b.tempoDesdeUltimaInteracao;
    });

    res.json({
      success: true,
      data: alertas,
      total: alertas.length,
      resumo: {
        alta: alertas.filter(a => a.prioridade >= 8).length,
        media: alertas.filter(a => a.prioridade >= 5 && a.prioridade < 8).length,
        baixa: alertas.filter(a => a.prioridade < 5).length
      }
    });

  } catch (error) {
    console.error('Erro ao buscar alertas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar alertas',
      message: error.message
    });
  }
});

// GET /api/alertas/urgentes - Apenas alertas de alta prioridade
router.get('/urgentes', async (req, res) => {
  try {
    const keys = await buscarChavesTelefone();
    const alertasUrgentes = [];

    for (const key of keys) {
      try {
        const mensagens = await buscarMensagensConversa(key);
        if (mensagens.length > 0) {
          const analise = ConversaAnalyzer.analisarConversa(mensagens);
          
          const prioridade = this.calcularPrioridade(analise);
          
          // Apenas alertas de alta prioridade (8+)
          if (prioridade >= 8) {
            const telefone = extrairTelefone(key);
            
            alertasUrgentes.push({
              telefone,
              primeiraInteracao: analise.primeiraInteracao,
              ultimaInteracao: analise.ultimaInteracao,
              totalMensagens: analise.totalMensagens,
              status: analise.status,
              duracao: analise.duracao,
              mensagensAI: analise.mensagensAI,
              mensagensHumanas: analise.mensagensHumanas,
              falhas: analise.falhas,
              resumo: analise.resumo,
              prioridade,
              tempoDesdeUltimaInteracao: this.calcularTempoDesdeUltimaInteracao(analise.ultimaInteracao)
            });
          }
        }
      } catch (error) {
        console.error(`Erro ao processar conversa ${key}:`, error);
        continue;
      }
    }

    // Ordenar por prioridade e tempo
    alertasUrgentes.sort((a, b) => {
      if (a.prioridade !== b.prioridade) {
        return b.prioridade - a.prioridade;
      }
      return a.tempoDesdeUltimaInteracao - b.tempoDesdeUltimaInteracao;
    });

    res.json({
      success: true,
      data: alertasUrgentes,
      total: alertasUrgentes.length
    });

  } catch (error) {
    console.error('Erro ao buscar alertas urgentes:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar alertas urgentes',
      message: error.message
    });
  }
});

// GET /api/alertas/tipos - Estatísticas por tipo de falha
router.get('/tipos', async (req, res) => {
  try {
    const keys = await buscarChavesTelefone();
    const tiposFalhas = {};
    const totalConversas = keys.length;
    let conversasComFalhas = 0;

    for (const key of keys) {
      try {
        const mensagens = await buscarMensagensConversa(key);
        if (mensagens.length > 0) {
          const analise = ConversaAnalyzer.analisarConversa(mensagens);
          
          if (analise.falhas.length > 0) {
            conversasComFalhas++;
            analise.falhas.forEach(falha => {
              if (!tiposFalhas[falha.tipo]) {
                tiposFalhas[falha.tipo] = {
                  quantidade: 0,
                  descricao: falha.descricao,
                  percentual: 0
                };
              }
              tiposFalhas[falha.tipo].quantidade++;
            });
          }
        }
      } catch (error) {
        console.error(`Erro ao processar conversa ${key}:`, error);
        continue;
      }
    }

    // Calcular percentuais
    Object.keys(tiposFalhas).forEach(tipo => {
      tiposFalhas[tipo].percentual = totalConversas > 0 ? 
        ((tiposFalhas[tipo].quantidade / totalConversas) * 100).toFixed(1) : 0;
    });

    res.json({
      success: true,
      data: {
        tipos: tiposFalhas,
        resumo: {
          totalConversas,
          conversasComFalhas,
          percentualComFalhas: totalConversas > 0 ? 
            ((conversasComFalhas / totalConversas) * 100).toFixed(1) : 0
        }
      }
    });

  } catch (error) {
    console.error('Erro ao buscar tipos de falhas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar tipos de falhas',
      message: error.message
    });
  }
});

// Métodos auxiliares
function calcularPrioridade(analise) {
  let prioridade = 0;
  
  // Base: status da conversa
  switch (analise.status) {
    case 'em_andamento':
      prioridade += 5;
      break;
    case 'falha':
      prioridade += 8;
      break;
    case 'sucesso':
      prioridade += 1;
      break;
  }
  
  // Adicionar pontos por falhas
  prioridade += analise.falhas.length * 2;
  
  // Adicionar pontos por tempo desde última interação
  const tempoDesdeUltima = this.calcularTempoDesdeUltimaInteracao(analise.ultimaInteracao);
  if (tempoDesdeUltima > 3600) { // Mais de 1 hora
    prioridade += 3;
  } else if (tempoDesdeUltima > 1800) { // Mais de 30 minutos
    prioridade += 2;
  } else if (tempoDesdeUltima > 900) { // Mais de 15 minutos
    prioridade += 1;
  }
  
  // Adicionar pontos por muitas mensagens da IA consecutivas
  const mensagensConsecutivasAI = this.contarMensagensConsecutivasAI(analise);
  if (mensagensConsecutivasAI >= 3) {
    prioridade += 4;
  } else if (mensagensConsecutivasAI >= 2) {
    prioridade += 2;
  }
  
  return Math.min(prioridade, 10); // Máximo 10
}

function calcularTempoDesdeUltimaInteracao(ultimaInteracao) {
  if (!ultimaInteracao) return 0;
  
  const agora = new Date();
  const ultima = new Date(ultimaInteracao);
  return Math.floor((agora - ultima) / 1000); // em segundos
}

function contarMensagensConsecutivasAI(analise) {
  // Esta função seria implementada se tivéssemos acesso às mensagens individuais
  // Por enquanto, vamos estimar baseado no número de falhas do tipo 'loop_ia'
  const falhasLoop = analise.falhas.filter(f => f.tipo === 'loop_ia').length;
  return falhasLoop > 0 ? 3 : 0; // Estimativa
}

// Adicionar métodos ao router para uso interno
router.calcularPrioridade = calcularPrioridade;
router.calcularTempoDesdeUltimaInteracao = calcularTempoDesdeUltimaInteracao;
router.contarMensagensConsecutivasAI = contarMensagensConsecutivasAI;

module.exports = router; 