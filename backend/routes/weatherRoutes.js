const express = require("express");
const router = express.Router();
const weatherController = require("../controllers/weatherController");

router.get("/forecast/:city", weatherController.getForecast);
router.get("/historical/:city", weatherController.getHistoricalData);
router.get("/air-quality/:city", weatherController.getAirQuality);
router.get("/alerts/:city", weatherController.getWeatherAlerts);
router.get("/dashboard/:city", weatherController.getDashboardData);

router.get("/:city", weatherController.getCurrentWeather);

module.exports = router;
