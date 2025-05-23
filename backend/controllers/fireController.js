const fireService = require("../services/fireService");
const logger = require("../utils/logger");

class FireController {
  async getActiveFires(req, res, next) {
    try {
      const { state = "MT", limit = 100 } = req.query;
      const data = await fireService.getActiveFires(state, parseInt(limit));
      res.json({
        success: true,
        data,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error("Error getting active fires:", error);
      next(error);
    }
  }

  async getFireHistory(req, res, next) {
    try {
      const { state = "MT", startDate, endDate } = req.query;
      const data = await fireService.getFireHistory(state, startDate, endDate);
      res.json({
        success: true,
        data,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error("Error getting fire history:", error);
      next(error);
    }
  }

  async getRiskAreas(req, res, next) {
    try {
      const { state = "MT" } = req.params;
      const data = await fireService.getRiskAreas(state);
      res.json({
        success: true,
        data,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error("Error getting risk areas:", error);
      next(error);
    }
  }

  async getFireStatistics(req, res, next) {
    try {
      const { state = "MT" } = req.params;
      const data = await fireService.getFireStatistics(state);
      res.json({
        success: true,
        data,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error("Error getting fire statistics:", error);
      next(error);
    }
  }
}

module.exports = new FireController();
