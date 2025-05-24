const cache = require("../utils/cache");
const logger = require("../utils/logger");

const cacheMiddleware = (ttl = 300) => {
  return async (req, res, next) => {
    if (req.method !== "GET") {
      return next();
    }

    const cacheKey = `route:${req.originalUrl}`;

    try {
      const cachedResponse = await cache.get(cacheKey);

      if (cachedResponse) {
        logger.debug(`Cache hit for route: ${req.originalUrl}`);
        res.setHeader("X-Cache", "HIT");
        res.setHeader("Content-Type", "application/json");
        return res.send(cachedResponse);
      }

      logger.debug(`Cache miss for route: ${req.originalUrl}`);

      const originalJson = res.json;

      res.json = function (data) {
        res.json = originalJson;
        if (res.statusCode >= 200 && res.statusCode < 300) {
          cache
            .set(cacheKey, JSON.stringify(data), ttl)
            .catch((err) => logger.error("Error setting cache:", err));
        }
        res.setHeader("X-Cache", "MISS");
        return res.json(data);
      };

      next();
    } catch (error) {
      logger.error("Cache middleware error:", error);
      next();
    }
  };
};

const invalidateCache = (pattern) => {
  return async (req, res, next) => {
    try {
      logger.info(`Cache invalidation requested for pattern: ${pattern}`);
      next();
    } catch (error) {
      logger.error("Cache invalidation error:", error);
      next();
    }
  };
};

module.exports = { cacheMiddleware, invalidateCache };
