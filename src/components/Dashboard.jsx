import React, { useState, useEffect, useCallback } from "react";
import DadosCidade from "./DadosCidade";
import MapaClima from "./MapaClima";
import GraficoClima from "./GraficoClima";
import AlertaClima from "./AlertaClima";
import HistoricoClima from "./HistoricoClima";
import alertaService from "../services/alertaService";
import { cidadesMT } from "../data/cidadesMT";
import {
  Cloud,
  Activity,
  Sun,
  Moon,
  Download,
  Share2,
  Bell,
  History,
  Tv,
} from "lucide-react";

const Dashboard = () => {
  const [cidadeSelecionada, setCidadeSelecionada] = useState("Cuiabá");
  const [inputCidade, setInputCidade] = useState("Cuiabá");
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [dadosCidade, setDadosCidade] = useState(null);
  const [dadosPrevisao, setDadosPrevisao] = useState([]);
  const [erroCidade, setErroCidade] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [tvMode, setTvMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showHistorico, setShowHistorico] = useState(false);
  const [sugestoes, setSugestoes] = useState([]);
  const [shouldNotify, setShouldNotify] = useState(false);
  const dias = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  useEffect(() => {
    const isDark = localStorage.getItem("darkMode") === "true";
    const isTv = localStorage.getItem("tvMode") === "true";
    setDarkMode(isDark);
    setTvMode(isTv);
    document.documentElement.classList.toggle("dark", isDark);
    document.body.classList.toggle("tv-mode", isTv);
  }, []);

  useEffect(() => {
    alertaService.solicitarPermissaoNotificacoes();
  }, []);

  useEffect(() => {
    const unsubscribe = alertaService.subscribe((alertas) => {
      setNotifications(alertas);
    });
    return () => unsubscribe();
  }, []);

  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", String(newDarkMode));
    document.documentElement.classList.toggle("dark", newDarkMode);
  };

  const toggleTvMode = () => {
    const newMode = !tvMode;
    setTvMode(newMode);
  };

  useEffect(() => {
    document.body.classList.toggle("tv-mode", tvMode);
    localStorage.setItem("tvMode", String(tvMode));
  }, [tvMode]);

  const exportarDados = () => {
    const dados = {
      cidade: cidadeSelecionada,
      temperatura: dadosCidade?.main?.temp,
      umidade: dadosCidade?.main?.humidity,
      qualidadeAr: dadosCidade?.aqi,
      dataExportacao: new Date().toISOString(),
      previsao: dadosPrevisao,
    };

    const blob = new Blob([JSON.stringify(dados, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clima-${cidadeSelecionada}-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const compartilhar = async () => {
    const texto = `Condições climáticas em ${cidadeSelecionada}:
Temperatura: ${dadosCidade?.main?.temp}°C
Umidade: ${dadosCidade?.main?.humidity}%
Qualidade do Ar: ${dadosCidade?.aqi}
Via Dashboard Climático`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Dashboard Climático",
          text: texto,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Erro ao compartilhar:", err);
      }
    } else {
      await navigator.clipboard.writeText(texto);
      alert("Dados copiados para a área de transferência!");
    }
  };

  const atualizarDados = useCallback(async (cidade, enviarAlertas = true) => {
    setLoading(true);
    setErroCidade("");
    try {
      const cidadePesquisa = cidade || cidadeSelecionada;
      const { obterDadosClima, obterQualidadeAr, obterPrevisaoClima } =
        await import("../services/apiClima");
      const dadosOWM = await obterDadosClima(cidadePesquisa);

      if (
        typeof dadosOWM?.main?.temp !== "number" ||
        typeof dadosOWM?.main?.humidity !== "number"
      ) {
        setDadosCidade(null);
        setErroCidade("Cidade não encontrada na OpenWeatherMap!");
        setLoading(false);
        return;
      }

      let aqi = 0;
      try {
        const lat = dadosOWM?.coord?.lat;
        const lon = dadosOWM?.coord?.lon;
        const dadosAr = await obterQualidadeAr(lat, lon);
        if (typeof dadosAr?.list?.[0]?.main?.aqi === "number") {
          aqi = dadosAr.list[0].main.aqi * 60;
        }
      } catch {
        aqi = 0;
      }

      const dadosConvertidos = {
        main: {
          temp: Math.round(dadosOWM.main.temp * 10) / 10,
          humidity: dadosOWM.main.humidity,
        },
        aqi,
        coord: dadosOWM.coord,
      };
      if (enviarAlertas) {
        await alertaService.avaliarCondicoes(
          {
            temperatura: dadosConvertidos.main.temp,
            umidade: dadosConvertidos.main.humidity,
            qualidadeAr: aqi,
          },
          cidadePesquisa
        );
      }

      setDadosCidade(dadosConvertidos);
      setLastUpdate(new Date());

      const previsao = await obterPrevisaoClima(cidadePesquisa);
      setDadosPrevisao(previsao?.list || []);
    } catch (error) {
      setDadosCidade(null);
      setErroCidade("Erro ao buscar dados da cidade.");
      setDadosPrevisao([]);
      console.error("Erro ao atualizar dados:", error);
    } finally {
      setLoading(false);
    }
  }, [inputCidade, cidadeSelecionada]);

  useEffect(() => {
    atualizarDados(cidadeSelecionada, shouldNotify).then(() => {
      if (shouldNotify) setShouldNotify(false);
    });
  }, [cidadeSelecionada, shouldNotify, atualizarDados]);

  const dadosGrafico =
    dadosPrevisao.length > 0
      ? dadosPrevisao
          .filter((item, idx) => idx % 8 === 0)
          .map((item) => ({
            nome: new Date(item.dt * 1000).toLocaleDateString("pt-BR", {
              weekday: "short",
            }),
            temperatura: Math.round(item.main.temp * 10) / 10,
            umidade: item.main.humidity,
          }))
      : [
          {
            nome: dias[new Date().getDay()],
            temperatura:
              typeof dadosCidade?.main?.temp === "number"
                ? dadosCidade.main.temp
                : 0,
            umidade:
              typeof dadosCidade?.main?.humidity === "number"
                ? dadosCidade.main.humidity
                : 0,
          },
        ];

  // Adicionar estado para sugestões de cidades
  const handleInputCidade = (e) => {
    const valor = e.target.value;
    setInputCidade(valor);
    if (valor.length > 1) {
      const sugestoesFiltradas = cidadesMT
        .map((c) => c.nome)
        .filter((nome) => nome.toLowerCase().includes(valor.toLowerCase()));
      setSugestoes(sugestoesFiltradas);
    } else {
      setSugestoes([]);
    }
  };

  // Função para selecionar sugestão
  const handleSugestaoClick = (nome) => {
    setInputCidade(nome);
    setSugestoes([]);
  };

  // Atualizar handlePesquisarCidade para validar cidade e só disparar notificações após submit
  const handlePesquisarCidade = (e) => {
    e.preventDefault();
    const cidadeValida = cidadesMT.some(
      (c) => c.nome.toLowerCase() === inputCidade.trim().toLowerCase()
    );
    if (!cidadeValida) {
      setErroCidade("Cidade não encontrada na lista!");
      return;
    }
    setErroCidade("");
    setShouldNotify(true);
    setCidadeSelecionada(inputCidade.trim());
  };

  // Simulação: exibir nuvem se a umidade for maior que 85% (exemplo)
  const mapaDados = {
    temperatura: dadosCidade
      ? { [cidadeSelecionada]: [dadosCidade.main.temp] }
      : {},
    umidade: dadosCidade
      ? { [cidadeSelecionada]: [dadosCidade.main.humidity] }
      : {},
    qualidadeAr: dadosCidade ? { [cidadeSelecionada]: dadosCidade.aqi } : {},
    chuva:
      typeof dadosCidade?.main?.humidity === "number"
        ? { [cidadeSelecionada]: dadosCidade.main.humidity > 85 }
        : {},
  };

  // Helper to render header section
  const renderHeader = () => (
    <header
      className={`backdrop-blur-xl shadow-2xl border-b-4 relative z-10 transition-colors duration-300 ${
        darkMode
          ? "bg-gradient-to-r from-blue-900/90 to-indigo-900/90 border-indigo-500/60"
          : "bg-gradient-to-r from-blue-600/90 to-indigo-500/90 border-blue-400/60"
      }`}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl md:text-5xl font-extrabold flex items-center gap-4 drop-shadow-lg text-white tracking-tight">
              <Cloud
                size={48}
                className={`${
                  darkMode ? "text-indigo-400" : "text-cyan-300"
                } drop-shadow-glow animate-spin-slow`}
              />
              Dashboard Climático
            </h1>
            <p className="text-blue-100 text-lg font-medium drop-shadow-md animate-fade-in">
              Monitoramento em tempo real das condições climáticas
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-2 rounded-lg transition-all duration-300 relative ${
                darkMode
                  ? "bg-gray-800 text-yellow-400 hover:bg-gray-700"
                  : "bg-blue-100 text-blue-900 hover:bg-blue-200"
              }`}
              aria-label="Notificações"
            >
              <Bell size={24} />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>
            <button
              onClick={compartilhar}
              className={`p-2 rounded-lg transition-all duration-300 ${
                darkMode
                  ? "bg-gray-800 text-purple-400 hover:bg-gray-700"
                  : "bg-blue-100 text-blue-900 hover:bg-blue-200"
              }`}
              aria-label="Compartilhar"
            >
              <Share2 size={24} />
            </button>
            <button
              onClick={exportarDados}
              className={`p-2 rounded-lg transition-all duration-300 ${
                darkMode
                  ? "bg-gray-800 text-green-400 hover:bg-gray-700"
                  : "bg-blue-100 text-blue-900 hover:bg-blue-200"
              }`}
              aria-label="Exportar dados"
            >
              <Download size={24} />
            </button>
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-all duration-300 ${
                darkMode
                  ? "bg-gray-800 text-yellow-400 hover:bg-gray-700"
                  : "bg-blue-100 text-blue-900 hover:bg-blue-200"
              }`}
              aria-label="Alternar tema"
            >
              {darkMode ? <Sun size={24} /> : <Moon size={24} />}
            </button>
            <button
              onClick={toggleTvMode}
              className={`p-2 rounded-lg transition-all duration-300 ${
                darkMode
                  ? "bg-gray-800 text-cyan-400 hover:bg-gray-700"
                  : "bg-blue-100 text-blue-900 hover:bg-blue-200"
              }`}
              aria-label="Modo TV"
            >
              <Tv size={24} />
            </button>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <p className="text-sm text-blue-100 font-semibold">
            Última atualização:{" "}
            <span className="font-extrabold">
              {lastUpdate.toLocaleTimeString("pt-BR")}
            </span>
            {loading && (
              <span className="ml-2 inline-flex items-center text-blue-100 animate-pulse">
                <Activity className="animate-spin mr-1" size={16} />
                Atualizando...
              </span>
            )}
          </p>
        </div>
      </div>
    </header>
  );

  // Helper to render notifications panel
  const renderNotifications = () => (
    <div
      className={`fixed top-24 right-4 w-80 z-50 rounded-xl shadow-2xl border-2 p-4 transition-all duration-300 ${
        darkMode
          ? "bg-gray-900 border-indigo-500/40"
          : "bg-white border-blue-300/40"
      }`}
    >
      <h3
        className={`text-lg font-bold mb-4 ${
          darkMode ? "text-white" : "text-gray-800"
        }`}
      >
        Notificações
      </h3>
      {notifications.length === 0 ? (
        <p
          className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
        >
          Nenhuma notificação no momento
        </p>
      ) : (
        <div className="space-y-2">
          {" "}
          {notifications.map((notif) => (
            <div
              key={`${notif.id}-${notif.timestamp}`}
              className={`p-3 rounded-lg ${
                darkMode ? "bg-gray-800 text-white" : "bg-blue-50 text-gray-800"
              }`}
            >
              <p className="text-sm">{notif.message}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(notif.timestamp).toLocaleTimeString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Helper to render the sidebar panel
  const renderSidebar = () => (
    <div className="lg:col-span-1 flex flex-col gap-8">
      <AlertaClima
        alertas={notifications}
        onDismiss={(id) => alertaService.dismissAlerta(id)}
        darkMode={darkMode}
      />
      <div
        className={`backdrop-blur-lg border-2 rounded-2xl shadow-2xl p-8 mb-4 animate-fade-in transition-colors duration-300 ${
          darkMode
            ? "bg-gray-900/80 border-indigo-500/40"
            : "bg-white/80 border-blue-300/40"
        }`}
      >
        <h2
          className={`text-2xl font-bold mb-6 tracking-tight transition-colors duration-300 ${
            darkMode ? "text-white" : "text-gray-800"
          }`}
        >
          Pesquise uma cidade
        </h2>
        <form onSubmit={handlePesquisarCidade} className="flex gap-3 relative">
          <input
            className={`w-full p-4 border-2 rounded-xl focus:ring-4 transition-all text-lg font-semibold ${
              darkMode
                ? "bg-gray-800/70 border-indigo-500 text-white placeholder:text-indigo-400 focus:ring-indigo-500/30 focus:border-indigo-400"
                : "bg-white/70 border-blue-300 text-gray-800 placeholder:text-blue-400 focus:ring-blue-400 focus:border-blue-500"
            }`}
            type="text"
            value={inputCidade}
            onChange={handleInputCidade}
            placeholder="Digite o nome da cidade"
            autoComplete="off"
            aria-autocomplete="list"
            aria-controls="autocomplete-list"
          />

          {sugestoes.length > 0 && (
            <ul
              id="autocomplete-list"
              className={`absolute z-20 top-full left-0 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl mt-1 shadow-lg max-h-56 overflow-y-auto custom-scrollbar animate-fade-in`}
            >
              {sugestoes.map((nome) => (
                <button
                  key={nome}
                  type="button"
                  className={`w-full text-left px-4 py-2 cursor-pointer transition-colors hover:bg-blue-100 dark:hover:bg-indigo-900 ${
                    darkMode ? "text-white" : "text-black"
                  }`}
                  onClick={() => handleSugestaoClick(nome)}
                >
                  {nome}
                </button>
              ))}
            </ul>
          )}
          <button
            type="submit"
            className={`px-6 py-3 rounded-xl font-bold text-lg shadow-lg hover:scale-105 transition-all duration-200 border-2 ${
              darkMode
                ? "bg-gradient-to-r from-indigo-600 to-blue-700 border-indigo-400 hover:from-purple-600 hover:to-indigo-700"
                : "bg-gradient-to-r from-blue-500 to-indigo-600 border-blue-300 hover:from-yellow-400 hover:to-pink-500"
            } text-white`}
            disabled={loading}
          >
            Pesquisar
          </button>
        </form>
        {erroCidade && (
          <div className="text-red-500 mt-4 text-lg font-bold animate-pulse">
            {erroCidade}
          </div>
        )}
      </div>
      <DadosCidade
        cidade={cidadeSelecionada}
        temperatura={
          typeof dadosCidade?.main?.temp === "number"
            ? dadosCidade.main.temp
            : 0
        }
        umidade={
          typeof dadosCidade?.main?.humidity === "number"
            ? dadosCidade.main.humidity
            : 0
        }
        qualidadeAr={dadosCidade?.aqi ?? 0}
        darkMode={darkMode}
      />
      <div className="flex gap-4">
        <button
          onClick={() => setShowHistorico(!showHistorico)}
          className={`flex-1 p-4 rounded-xl font-bold text-base shadow-lg hover:scale-105 transition-all duration-200 border-2 flex items-center justify-center gap-2 ${
            darkMode
              ? "bg-gray-800 border-indigo-500/40 text-white hover:bg-gray-700"
              : "bg-white border-blue-300/40 text-gray-800 hover:bg-blue-50"
          }`}
        >
          <History size={20} />
          Histórico
        </button>
        <button
          onClick={() => atualizarDados(cidadeSelecionada, true)}
          disabled={loading}
          className={`flex-1 p-4 rounded-xl font-bold text-base shadow-lg hover:scale-105 transition-all duration-200 border-2 flex items-center justify-center gap-2 ${
            darkMode
              ? "bg-indigo-600 border-indigo-400 text-white hover:bg-indigo-700"
              : "bg-blue-600 border-blue-300 text-white hover:bg-blue-700"
          } disabled:opacity-60`}
        >
          <Activity size={20} className={loading ? "animate-spin" : ""} />
          {loading ? "Atualizando..." : "Atualizar"}
        </button>
      </div>
    </div>
  );

  // Helper to render the main content (map and charts)
  const renderMainContent = () => (
    <div className="lg:col-span-2 flex flex-col gap-10">
      <div
        className={`rounded-2xl border-4 shadow-2xl overflow-hidden backdrop-blur-lg animate-fade-in transition-colors duration-300 ${
          darkMode
            ? "border-indigo-500/60 bg-gray-900/70"
            : "border-blue-400/60 bg-white/70"
        }`}
      >
        <MapaClima
          cidadeSelecionada={cidadeSelecionada}
          setCidadeSelecionada={setCidadeSelecionada}
          cidades={
            typeof dadosCidade?.coord?.lat === "number" &&
            typeof dadosCidade?.coord?.lon === "number"
              ? [
                  {
                    nome: cidadeSelecionada,
                    lat: dadosCidade.coord.lat,
                    lon: dadosCidade.coord.lon,
                  },
                ]
              : []
          }
          dados={mapaDados}
          darkMode={darkMode}
        />
      </div>
      <div className="grid grid-cols-1 gap-8">
        {showHistorico ? (
          <HistoricoClima dados={dadosGrafico} darkMode={darkMode} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <GraficoClima
              dados={dadosGrafico}
              titulo="Previsão para os próximos dias"
              dataKey="temperatura"
              cor={darkMode ? "#6366f1" : "#3182CE"}
              dominio={[0, 45]}
              tipo="area"
              darkMode={darkMode}
            />
            <GraficoClima
              dados={dadosGrafico}
              titulo="Umidade relativa do ar"
              dataKey="umidade"
              cor={darkMode ? "#818cf8" : "#38BDF8"}
              dominio={[0, 100]}
              tipo="area"
              darkMode={darkMode}
            />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode
          ? "bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900"
          : "bg-gradient-to-br from-blue-50 via-blue-100 to-white"
      }`}
    >
      {renderHeader()}
      {showNotifications && renderNotifications()}
      <div className="container mx-auto px-4 py-10 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {renderSidebar()}
          {renderMainContent()}
        </div>
      </div>

      <footer className="w-full text-center py-6 mt-10 text-sm font-semibold text-gray-500 dark:text-gray-400 bg-transparent select-none">
        Desenvolvido em 2025 por Gustavo para Unic
      </footer>
    </div>
  );
};

export default Dashboard;
