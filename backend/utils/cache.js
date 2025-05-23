// backend/utils/cache.js
const redis = require("redis");
const config = require("../config");
const logger = require("./logger");

class CacheService {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async init() {
    await this.connect();
  }

  async connect() {
    try {
      this.client = redis.createClient({
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password || undefined,
        retry_strategy: (options) => {
          if (options.error && options.error.code === "ECONNREFUSED") {
            logger.error("Redis connection refused");
            // Stop retrying by returning null
            return null;
          }
          if (options.total_retry_time > 1000 * 60 * 60) {
            logger.error("Retry time exhausted");
            // Stop retrying by returning null
            return null;
          }
          if (options.attempt > 10) {
            logger.error("Max retry attempts reached");
            // Stop retrying by returning null
            return null;
          }
          // Continue retrying after a delay (in ms)
          return Math.min(options.attempt * 100, 3000);
        },
      });

      await this.client.connect();

      this.client.on("error", (err) => {
        logger.error("Redis Client Error:", err);
        this.isConnected = false;
      });

      this.client.on("connect", () => {
        logger.info("Redis Client Connected");
        this.isConnected = true;
      });
    } catch (error) {
      logger.error("Failed to connect to Redis:", error);
      this.isConnected = false;
    }
  }

  async get(key) {
    if (!this.isConnected) {
      logger.warn("Cache miss - Redis not connected");
      return null;
    }

    try {
      const value = await this.client.get(key);
      if (value) {
        logger.debug(`Cache hit for key: ${key}`);
      } else {
        logger.debug(`Cache miss for key: ${key}`);
      }
      return value;
    } catch (error) {
      logger.error(`Error getting cache key ${key}:`, error);
      return null;
    }
  }

  async set(key, value, ttl = config.redis.ttl) {
    if (!this.isConnected) {
      logger.warn("Cannot set cache - Redis not connected");
      return false;
    }

    try {
      await this.client.setEx(key, ttl, value);
      logger.debug(`Cache set for key: ${key} with TTL: ${ttl}s`);
      return true;
    } catch (error) {
      logger.error(`Error setting cache key ${key}:`, error);
      return false;
    }
  }

  async del(key) {
    if (!this.isConnected) {
      return false;
    }

    try {
      await this.client.del(key);
      logger.debug(`Cache deleted for key: ${key}`);
      return true;
    } catch (error) {
      logger.error(`Error deleting cache key ${key}:`, error);
      return false;
    }
  }

  async flush() {
    if (!this.isConnected) {
      return false;
    }

    try {
      await this.client.flushAll();
      logger.info("Cache flushed");
      return true;
    } catch (error) {
      logger.error("Error flushing cache:", error);
      return false;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
      logger.info("Redis client disconnected");
    }
  }
}

// Fallback para quando Redis não está disponível
class InMemoryCache {
  constructor() {
    this.cache = new Map();
    this.timers = new Map();
  }

  async get(key) {
    const value = this.cache.get(key);
    logger.debug(`InMemory cache ${value ? "hit" : "miss"} for key: ${key}`);
    return value || null;
  }

  async set(key, value, ttl = 300) {
    this.cache.set(key, value);

    // Limpar timer existente se houver
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    // Definir novo timer para expiração
    const timer = setTimeout(() => {
      this.cache.delete(key);
      this.timers.delete(key);
    }, ttl * 1000);

    this.timers.set(key, timer);
    logger.debug(`InMemory cache set for key: ${key} with TTL: ${ttl}s`);
    return true;
  }

  async del(key) {
    this.cache.delete(key);
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
    return true;
  }

  async flush() {
    this.cache.clear();
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.clear();
    logger.info("InMemory cache flushed");
    return true;
  }

  async disconnect() {
    await this.flush();
  }
}

let cacheInstance;

if (config.redis.host && config.redis.host !== "none") {
  cacheInstance = new CacheService();
  // Remember to call init() on cacheInstance somewhere in your app startup
} else {
  logger.warn("Redis not configured, using in-memory cache");
  cacheInstance = new InMemoryCache();
}

module.exports = cacheInstance;
