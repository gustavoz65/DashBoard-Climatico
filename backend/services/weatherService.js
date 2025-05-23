const axios = require("axios");
const config = require("../config");
const OPENWEATHER_API_KEY = config.OPENWEATHER_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";
const AIR_POLLUTION_URL =
  "https://api.openweathermap.org/data/2.5/air_pollution";
const ONE_CALL_URL = "https://api.openweathermap.org/data/2.5/onecall";

/**
 * Busca o clima por nome da cidade OU pelo ID da cidade.
 * Se receber um número, busca por ID. Se receber string, busca por nome.
 */
async function getWeatherByCity(cityOrId) {
  try {
    const params = {
      appid: OPENWEATHER_API_KEY,
      units: "metric",
      lang: "pt_br",
    };

    // Se for número, busca por ID. Se for string, busca por nome.
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

/**
 * Busca a qualidade do ar utilizando as coordenadas retornadas pelo clima.
 */
async function getAirQualityByCity(cityOrId) {
  try {
    // Obtém primeiro os dados de clima para extrair latitude e longitude
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

/**
 * Busca alertas meteorológicos utilizando a One Call API.
 * É necessário ter alertas disponíveis para a região e uma conta habilitada.
 */
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
    return response.data; // Geralmente contém a propriedade "alerts" se houver alertas.
  } catch (error) {
    throw new Error("Erro ao buscar alertas meteorológicos: " + error.message);
  }
}

/**
 * Agrega os dados para o dashboard, unindo clima, qualidade do ar e alertas.
 * Garante que os alertas sejam retornados como um array, mesmo que vazio.
 */
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
