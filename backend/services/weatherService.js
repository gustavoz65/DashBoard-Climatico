const axios = require("axios");
const config = require("../config");
const OPENWEATHER_API_KEY = config.OPENWEATHER_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";
const AIR_POLLUTION_URL =
  "https://api.openweathermap.org/data/2.5/air_pollution";
const ONE_CALL_URL = "https://api.openweathermap.org/data/2.5/onecall";

async function getWeatherByCity(cityOrId) {
  try {
    const params = {
      appid: OPENWEATHER_API_KEY,
      units: "metric",
      lang: "pt_br",
    };
    if (!isNaN(Number(cityOrId))) {
      params.id = cityOrId;
    } else {
      params.q = cityOrId;
    }
    const response = await axios.get(BASE_URL, { params });
    return response.data;
  } catch (error) {
    throw new Error("Erro ao buscar dados do clima: " + error.message);
  }
}

async function getAirQualityByCity(cityOrId) {
  try {
    const weatherData = await getWeatherByCity(cityOrId);
    const { lat, lon } = weatherData.coord;
    const params = {
      appid: OPENWEATHER_API_KEY,
      lat,
      lon,
    };
    const response = await axios.get(AIR_POLLUTION_URL, { params });
    return response.data;
  } catch (error) {
    throw new Error(
      "Erro ao buscar dados de qualidade do ar: " + error.message
    );
  }
}

async function getWeatherAlerts(cityOrId) {
  try {
    const weatherData = await getWeatherByCity(cityOrId);
    const { lat, lon } = weatherData.coord;
    const params = {
      appid: OPENWEATHER_API_KEY,
      lat,
      lon,
      exclude: "current,minutely,hourly,daily",
    };
    const response = await axios.get(ONE_CALL_URL, { params });
    return response.data;
  } catch (error) {
    throw new Error("Erro ao buscar alertas meteorológicos: " + error.message);
  }
}

async function getDashboardData(cityOrId) {
  try {
    const weather = await getWeatherByCity(cityOrId);
    const airQuality = await getAirQualityByCity(cityOrId);
    let alertsData = {};
    try {
      alertsData = await getWeatherAlerts(cityOrId);
    } catch (e) {
      console.error("Erro ao buscar alertas meteorológicos", e);
      alertsData = { alerts: [] };
    }
    return {
      weather,
      airQuality,
      alerts: alertsData.alerts || [],
    };
  } catch (error) {
    throw new Error("Erro ao buscar dados do dashboard: " + error.message);
  }
}

module.exports = {
  getWeatherByCity,
  getAirQualityByCity,
  getWeatherAlerts,
  getDashboardData,
};
