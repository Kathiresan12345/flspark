const Redis = require('ioredis');

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: null, // Required for BullMQ
});

redis.on('error', (err) => {
  if (err.code === 'ECONNREFUSED') {
    console.error('❌ Redis Connection Refused: Ensure Redis is running at ' + redisUrl);
  } else {
    console.error('❌ Redis Error:', err.message);
  }
});

module.exports = redis;
