// src/services/apiClima.js
const API_KEY = "818386117f13b8efbb4cc19d7574ef61";

function removerAcentos(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export const obterDadosClima = async (cidade) => {
  try {
    let resposta = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${cidade},br&units=metric&appid=${API_KEY}`
    );
    let json = await resposta.json();
    if (json.cod === "404" || json.cod === 404) {
      const cidadeSemAcento = removerAcentos(cidade);
      resposta = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cidadeSemAcento},br&units=metric&appid=${API_KEY}`
      );
      json = await resposta.json();
      if (json.cod === "404" || json.cod === 404) {
        resposta = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${cidadeSemAcento}&units=metric&appid=${API_KEY}`
        );
        json = await resposta.json();
      }
    }
    return json;
  } catch (erro) {
    console.error("Erro ao buscar dados climáticos:", erro);
    return null;
  }
};

export const obterQualidadeAr = async (lat, lon) => {
  try {
    const resposta = await fetch(
      `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
    );
    return await resposta.json();
  } catch (erro) {
    console.error("Erro ao buscar qualidade do ar:", erro);
    return null;
  }
};

export const obterPrevisaoClima = async (cidade) => {
  try {
    const dadosCidade = await obterDadosClima(cidade);
    if (!dadosCidade?.coord) return null;
    const { lat, lon } = dadosCidade.coord;
    const resposta = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}&lang=pt_br`
    );
    const json = await resposta.json();
    return json;
  } catch (erro) {
    console.error("Erro ao buscar previsão do clima:", erro);
    return null;
  }
};
