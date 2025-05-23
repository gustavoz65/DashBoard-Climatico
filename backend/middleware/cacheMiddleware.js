// backend/middleware/cacheMiddleware.js
const cache = require("../utils/cache");
const logger = require("../utils/logger");

const cacheMiddleware = (ttl = 300) => {
  return async (req, res, next) => {
    // Apenas fazer cache de requisições GET
    if (req.method !== "GET") {
      return next();
    }

    // Criar chave de cache baseada na URL e query params
    const cacheKey = `route:${req.originalUrl}`;

    try {
      // Tentar obter do cache
      const cachedResponse = await cache.get(cacheKey);

      if (cachedResponse) {
        logger.debug(`Cache hit for route: ${req.originalUrl}`);

        // Adicionar header indicando que veio do cache
        res.setHeader("X-Cache", "HIT");
        res.setHeader("Content-Type", "application/json");

        return res.send(cachedResponse);
      }

      // Se não houver cache, continuar com a requisição
      logger.debug(`Cache miss for route: ${req.originalUrl}`);

      // Sobrescrever res.json para capturar a resposta
      const originalJson = res.json;

      res.json = function (data) {
        // Chamar o método original
        res.json = originalJson;

        // Salvar no cache apenas respostas de sucesso
        if (res.statusCode >= 200 && res.statusCode < 300) {
          cache
            .set(cacheKey, JSON.stringify(data), ttl)
            .catch((err) => logger.error("Error setting cache:", err));
        }

        // Adicionar header indicando que não veio do cache
        res.setHeader("X-Cache", "MISS");

        return res.json(data);
      };

      next();
    } catch (error) {
      logger.error("Cache middleware error:", error);
      // Em caso de erro, continuar sem cache
      next();
    }
  };
};

// Middleware para invalidar cache
const invalidateCache = (pattern) => {
  return async (req, res, next) => {
    try {
      // Por enquanto, vamos apenas logar
      // Em produção, você poderia implementar invalidação por padrão
      logger.info(`Cache invalidation requested for pattern: ${pattern}`);
      next();
    } catch (error) {
      logger.error("Cache invalidation error:", error);
      next();
    }
  };
};

module.exports = { cacheMiddleware, invalidateCache };
