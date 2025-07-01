require('dotenv').config();
const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL);

redis.on('connect', () => {
  console.log('✅ Conectado ao Redis');
  process.exit(0);
});

redis.on('error', (err) => {
  console.error('❌ Erro na conexão com Redis:', err);
  process.exit(1);
});
