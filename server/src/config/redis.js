const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL, {
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keepAlive: 30000,
  connectTimeout: 10000,
  commandTimeout: 5000,
});

redis.on('connect', () => {
  console.log('✅ Conectado ao Redis');
});

redis.on('error', (err) => {
  console.error('❌ Erro na conexão com Redis:', err);
});

redis.on('close', () => {
  console.log('🔌 Conexão com Redis fechada');
});

module.exports = redis; 