const Redis = require('ioredis');

const hash = 'PANIC_API_SESSION';

class SessionStore {
  constructor() {
    this.redis = new Redis({
      port: 6379,
      host: 'redis',
    });
  }
  load(sessionId) {
    return this.redis.hget(hash,sessionId);
  }
  save(sessionId, data) {
    return this.redis.hset(hash,sessionId,data);
  }
  remove(sessionId) {
    return this.redis.hdel(hash,sessionId);
  }
}
module.exports = SessionStore;
module.exports.defaults = SessionStore;
