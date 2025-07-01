const redis = require('../config/redis');

/**
 * Busca todas as chaves que representam números de telefone no Redis
 * Suporta diferentes formatos: apenas números, com @s.whatsapp.net, etc.
 */
async function buscarChavesTelefone() {
  try {
    // Buscar todas as chaves
    const todasChaves = await redis.keys('*');
    
    // Filtrar apenas chaves que parecem ser números de telefone
    const chavesTelefone = todasChaves.filter(chave => {
      // Remove sufixos comuns
      const numeroLimpo = chave
        .replace('@s.whatsapp.net', '')
        .replace('@c.us', '')
        .replace('@g.us', '');
      
      // Verifica se é um número de telefone (apenas dígitos, possivelmente com +)
      return /^\+?[\d\s\-\(\)]+$/.test(numeroLimpo) && numeroLimpo.length >= 8;
    });
    
    console.log(`Encontradas ${chavesTelefone.length} chaves de telefone de ${todasChaves.length} chaves totais`);
    return chavesTelefone;
  } catch (error) {
    console.error('Erro ao buscar chaves de telefone:', error);
    return [];
  }
}

/**
 * Extrai o número de telefone limpo de uma chave do Redis
 */
function extrairTelefone(chave) {
  return chave
    .replace('@s.whatsapp.net', '')
    .replace('@c.us', '')
    .replace('@g.us', '');
}

/**
 * Busca mensagens de uma conversa, suportando diferentes tipos de chave
 */
async function buscarMensagensConversa(chave) {
  try {
    const type = await redis.type(chave);
    let mensagens = [];

    if (type === 'string') {
      const conversaData = await redis.get(chave);
      if (conversaData) {
        mensagens = JSON.parse(conversaData);
      }
    } else if (type === 'list') {
      const listData = await redis.lrange(chave, 0, -1);
      mensagens = listData.map(item => JSON.parse(item));
    }

    return mensagens;
  } catch (error) {
    console.error(`Erro ao buscar mensagens da conversa ${chave}:`, error);
    return [];
  }
}

module.exports = {
  buscarChavesTelefone,
  extrairTelefone,
  buscarMensagensConversa
}; 