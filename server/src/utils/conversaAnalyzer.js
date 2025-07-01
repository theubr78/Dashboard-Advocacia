class ConversaAnalyzer {
  static analisarConversa(mensagens) {
    if (!Array.isArray(mensagens) || mensagens.length === 0) {
      return {
        status: 'vazio',
        duracao: 0,
        totalMensagens: 0,
        mensagensAI: 0,
        mensagensHumanas: 0,
        falhas: [],
        resumo: 'Conversa vazia'
      };
    }

    const mensagensAI = mensagens.filter(msg => msg.type === 'ai');
    const mensagensHumanas = mensagens.filter(msg => msg.type === 'human');
    const totalMensagens = mensagens.length;

    // Calcular duração (diferença entre primeira e última mensagem)
    const primeiraMsg = mensagens[0];
    const ultimaMsg = mensagens[mensagens.length - 1];
    const duracao = this.calcularDuracao(primeiraMsg, ultimaMsg);

    // Detectar falhas
    const falhas = this.detectarFalhas(mensagens);

    // Determinar status
    const status = this.determinarStatus(mensagens, falhas);

    // Gerar resumo
    const resumo = this.gerarResumo(mensagens, status, falhas);

    return {
      status,
      duracao,
      totalMensagens,
      mensagensAI: mensagensAI.length,
      mensagensHumanas: mensagensHumanas.length,
      falhas,
      resumo,
      primeiraInteracao: primeiraMsg?.timestamp || null,
      ultimaInteracao: ultimaMsg?.timestamp || null
    };
  }

  static calcularDuracao(primeiraMsg, ultimaMsg) {
    if (!primeiraMsg?.timestamp || !ultimaMsg?.timestamp) {
      return 0;
    }

    const inicio = new Date(primeiraMsg.timestamp);
    const fim = new Date(ultimaMsg.timestamp);
    return Math.floor((fim - inicio) / 1000); // duração em segundos
  }

  static detectarFalhas(mensagens) {
    const falhas = [];

    // Verificar se há muitas mensagens consecutivas da IA (possível loop)
    let mensagensConsecutivasAI = 0;
    for (let i = 0; i < mensagens.length; i++) {
      if (mensagens[i].type === 'ai') {
        mensagensConsecutivasAI++;
        if (mensagensConsecutivasAI >= 3) {
          falhas.push({
            tipo: 'loop_ia',
            descricao: 'IA enviando muitas mensagens consecutivas',
            posicao: i
          });
        }
      } else {
        mensagensConsecutivasAI = 0;
      }
    }

    // Verificar se há mensagens repetidas da IA
    const conteudosAI = mensagens
      .filter(msg => msg.type === 'ai')
      .map(msg => msg.data?.content || '');
    
    const conteudosUnicos = [...new Set(conteudosAI)];
    if (conteudosAI.length > conteudosUnicos.length + 2) {
      falhas.push({
        tipo: 'repeticao',
        descricao: 'IA repetindo mensagens',
        posicao: -1
      });
    }

    // Verificar se a conversa termina com mensagem da IA sem resposta
    if (mensagens.length > 0 && mensagens[mensagens.length - 1].type === 'ai') {
      falhas.push({
        tipo: 'sem_resposta',
        descricao: 'Conversa terminou com mensagem da IA sem resposta',
        posicao: mensagens.length - 1
      });
    }

    // Verificar se há muito tempo entre mensagens (mais de 30 minutos)
    for (let i = 1; i < mensagens.length; i++) {
      const tempoAnterior = new Date(mensagens[i-1].timestamp);
      const tempoAtual = new Date(mensagens[i].timestamp);
      const diferenca = Math.floor((tempoAtual - tempoAnterior) / 1000 / 60); // em minutos
      
      if (diferenca > 30) {
        falhas.push({
          tipo: 'demora',
          descricao: `Demora de ${diferenca} minutos entre mensagens`,
          posicao: i
        });
      }
    }

    return falhas;
  }

  static determinarStatus(mensagens, falhas) {
    if (mensagens.length === 0) return 'vazio';
    
    const ultimaMsg = mensagens[mensagens.length - 1];
    const temFalhas = falhas.length > 0;
    
    // Se a última mensagem é da IA e tem falhas, provavelmente falhou
    if (ultimaMsg.type === 'ai' && temFalhas) {
      return 'falha';
    }
    
    // Se a última mensagem é humana, ainda está em andamento
    if (ultimaMsg.type === 'human') {
      return 'em_andamento';
    }
    
    // Se não tem falhas e termina com IA, provavelmente sucesso
    if (!temFalhas && ultimaMsg.type === 'ai') {
      return 'sucesso';
    }
    
    // Se tem falhas mas termina com IA, é falha
    if (temFalhas && ultimaMsg.type === 'ai') {
      return 'falha';
    }
    
    return 'em_andamento';
  }

  static gerarResumo(mensagens, status, falhas) {
    const totalMsg = mensagens.length;
    const msgAI = mensagens.filter(m => m.type === 'ai').length;
    const msgHumanas = mensagens.filter(m => m.type === 'human').length;
    
    let resumo = `Conversa com ${totalMsg} mensagens (${msgAI} IA, ${msgHumanas} humanas). `;
    
    switch (status) {
      case 'sucesso':
        resumo += 'Atendimento concluído com sucesso.';
        break;
      case 'falha':
        resumo += `Falha detectada: ${falhas.length} problema(s) identificado(s).`;
        break;
      case 'em_andamento':
        resumo += 'Conversa ainda em andamento.';
        break;
      case 'vazio':
        resumo = 'Conversa vazia.';
        break;
    }
    
    return resumo;
  }

  static formatarDuracao(segundos) {
    if (segundos < 60) {
      return `${segundos}s`;
    } else if (segundos < 3600) {
      const minutos = Math.floor(segundos / 60);
      return `${minutos}min`;
    } else {
      const horas = Math.floor(segundos / 3600);
      const minutos = Math.floor((segundos % 3600) / 60);
      return `${horas}h ${minutos}min`;
    }
  }
}

module.exports = ConversaAnalyzer; 