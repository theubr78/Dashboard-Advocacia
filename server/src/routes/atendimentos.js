const express = require('express');
const redis = require('../config/redis');
const ConversaAnalyzer = require('../utils/conversaAnalyzer');
const { buscarChavesTelefone, extrairTelefone, buscarMensagensConversa } = require('../utils/redisHelpers');

const router = express.Router();

// GET /api/atendimentos - Lista resumida dos atendimentos
router.get('/', async (req, res) => {
  try {
    const keys = await buscarChavesTelefone();
    const atendimentos = [];

    for (const key of keys) {
      try {
        const mensagens = await buscarMensagensConversa(key);

        console.log('Telefone:', key, 'Mensagens:', mensagens.length);

        if (mensagens.length > 0) {
          const analise = ConversaAnalyzer.analisarConversa(mensagens);
          console.log('Análise:', { status: analise.status, falhas: analise.falhas, telefone: key });
          const telefone = extrairTelefone(key);
          atendimentos.push({
            telefone,
            primeiraInteracao: analise.primeiraInteracao,
            ultimaInteracao: analise.ultimaInteracao,
            totalMensagens: analise.totalMensagens,
            status: analise.status,
            duracao: analise.duracao,
            mensagensAI: analise.mensagensAI,
            mensagensHumanas: analise.mensagensHumanas,
            temFalhas: analise.falhas.length > 0
          });
        }
      } catch (error) {
        console.error(`Erro ao processar conversa ${key}:`, error);
        continue;
      }
    }

    atendimentos.sort((a, b) => {
      if (!a.ultimaInteracao) return 1;
      if (!b.ultimaInteracao) return -1;
      return new Date(b.ultimaInteracao) - new Date(a.ultimaInteracao);
    });

    res.json({
      success: true,
      data: atendimentos,
      total: atendimentos.length
    });

  } catch (error) {
    console.error('Erro ao buscar atendimentos:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar atendimentos',
      message: error.message
    });
  }
});

// GET /api/atendimentos/:telefone - Retorna conversa completa
router.get('/:telefone', async (req, res) => {
  try {
    const { telefone } = req.params;
    
    // Tentar diferentes formatos de chave
    const possiveisChaves = [
      `${telefone}@s.whatsapp.net`,
      `${telefone}@c.us`,
      telefone
    ];
    
    let mensagens = [];
    let chaveEncontrada = null;
    
    for (const key of possiveisChaves) {
      try {
        const type = await redis.type(key);
        if (type === 'string' || type === 'list') {
          mensagens = await buscarMensagensConversa(key);
          if (mensagens.length > 0) {
            chaveEncontrada = key;
            break;
          }
        }
      } catch (error) {
        console.error(`Erro ao tentar chave ${key}:`, error);
        continue;
      }
    }
    
    if (!chaveEncontrada || mensagens.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Conversa não encontrada'
      });
    }
    
    console.log('Telefone:', chaveEncontrada, 'Mensagens:', mensagens.length);
    
    const analise = ConversaAnalyzer.analisarConversa(mensagens);
    console.log('Análise:', { status: analise.status, falhas: analise.falhas, telefone: chaveEncontrada });
    const mensagensFormatadas = mensagens.map((msg, index) => ({
      id: index,
      type: msg.type,
      content: msg.data?.content || '',
      timestamp: msg.timestamp || new Date().toISOString(),
      isFalha: analise.falhas.some(falha => falha.posicao === index)
    }));
    
    res.json({
      success: true,
      data: {
        telefone,
        mensagens: mensagensFormatadas,
        analise,
        duracaoFormatada: ConversaAnalyzer.formatarDuracao(analise.duracao)
      }
    });
    
  } catch (error) {
    console.error('Erro ao buscar conversa:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar conversa',
      message: error.message
    });
  }
});

// GET /api/atendimentos/status/:status - Filtrar por status
router.get('/status/:status', async (req, res) => {
  try {
    const { status } = req.params;
    const keys = await buscarChavesTelefone();
    const atendimentos = [];
    
    for (const key of keys) {
      try {
        const mensagens = await buscarMensagensConversa(key);
        
        console.log('Telefone:', key, 'Mensagens:', mensagens.length);
        
        if (mensagens.length > 0) {
          const analise = ConversaAnalyzer.analisarConversa(mensagens);
          console.log('Análise:', { status: analise.status, falhas: analise.falhas, telefone: key });
          if (analise.status === status) {
            const telefone = extrairTelefone(key);
            atendimentos.push({
              telefone,
              primeiraInteracao: analise.primeiraInteracao,
              ultimaInteracao: analise.ultimaInteracao,
              totalMensagens: analise.totalMensagens,
              status: analise.status,
              duracao: analise.duracao,
              mensagensAI: analise.mensagensAI,
              mensagensHumanas: analise.mensagensHumanas,
              temFalhas: analise.falhas.length > 0
            });
          }
        }
      } catch (error) {
        console.error(`Erro ao processar conversa ${key}:`, error);
        continue;
      }
    }
    atendimentos.sort((a, b) => {
      if (!a.ultimaInteracao) return 1;
      if (!b.ultimaInteracao) return -1;
      return new Date(b.ultimaInteracao) - new Date(a.ultimaInteracao);
    });
    res.json({
      success: true,
      data: atendimentos,
      total: atendimentos.length,
      status
    });
  } catch (error) {
    console.error('Erro ao filtrar atendimentos:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao filtrar atendimentos',
      message: error.message
    });
  }
});

module.exports = router; 