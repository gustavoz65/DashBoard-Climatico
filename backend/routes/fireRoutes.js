// backend/routes/fireRoutes.js
const express = require("express");
const router = express.Router();
const fireController = require("../controllers/fireController");
const { cacheMiddleware } = require("../middleware/cacheMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { fireSchema } = require("../validators/fireValidator");

// Rotas de detecção de incêndios
router.get(
  "/active",
  validateRequest(fireSchema.activeQuery, "query"),
  cacheMiddleware(300), // Cache de 5 minutos
  fireController.getActiveFires
);

router.get(
  "/history",
  validateRequest(fireSchema.historyQuery, "query"),
  cacheMiddleware(3600), // Cache de 1 hora
  fireController.getFireHistory
);

router.get(
  "/risk-areas",
  validateRequest(fireSchema.stateParam, "params"),
  cacheMiddleware(1800), // Cache de 30 minutos
  fireController.getRiskAreas
);

router.get(
  "/statistics/:state",
  validateRequest(fireSchema.stateParam, "params"),
  cacheMiddleware(3600),
  fireController.getFireStatistics
);

module.exports = router;
