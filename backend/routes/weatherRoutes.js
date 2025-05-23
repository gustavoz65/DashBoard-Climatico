const express = require("express");
const router = express.Router();
const weatherController = require("../controllers/weatherController");

// Rotas para futuras implementações (mais específicas primeiro)
router.get("/forecast/:city", weatherController.getForecast);
router.get("/historical/:city", weatherController.getHistoricalData);
router.get("/air-quality/:city", weatherController.getAirQuality);
router.get("/alerts/:city", weatherController.getWeatherAlerts);
router.get("/dashboard/:city", weatherController.getDashboardData);

// Rota para clima atual (deve ser a última)
router.get("/:city", weatherController.getCurrentWeather);

module.exports = router;
