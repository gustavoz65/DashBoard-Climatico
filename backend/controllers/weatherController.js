const weatherService = require("../services/weatherService");
const logger = require("../utils/logger");

class WeatherController {
  async getCurrentWeather(req, res, next) {
    try {
      const { city } = req.params;
      logger.info(`Buscando clima para cidade: ${city}`);
      const data = await weatherService.getWeatherByCity(city);

      if (!data || data.cod === "404" || data.cod === 404) {
        logger.warn(`Cidade não encontrada: ${city}`);
        return res.status(404).json({
          success: false,
          message: "Cidade não encontrada",
          data: null,
          timestamp: new Date().toISOString(),
        });
      }

      res.json({
        success: true,
        data,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error("Erro ao obter clima atual:", error);
      res.status(500).json({
        success: false,
        message: "Erro interno ao buscar dados do clima",
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  async getForecast(req, res, next) {
    res.status(501).json({ success: false, message: "Not implemented" });
  }

  async getHistoricalData(req, res, next) {
    res.status(501).json({ success: false, message: "Not implemented" });
  }

  async getAirQuality(req, res, next) {
    res.status(501).json({ success: false, message: "Not implemented" });
  }

  async getWeatherAlerts(req, res, next) {
    res.status(501).json({ success: false, message: "Not implemented" });
  }

  async getDashboardData(req, res, next) {
    res.status(501).json({ success: false, message: "Not implemented" });
  }
}

module.exports = new WeatherController();
