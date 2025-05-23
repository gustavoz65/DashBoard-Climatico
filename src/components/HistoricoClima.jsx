import React from "react";
import PropTypes from "prop-types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";

const TendenciaIcon = ({ tendencia }) => {
  switch (tendencia) {
    case "subindo":
      return <ArrowUp className="text-red-500" size={20} />;
    case "descendo":
      return <ArrowDown className="text-blue-500" size={20} />;
    default:
      return <Minus className="text-gray-500" size={20} />;
  }
};

TendenciaIcon.propTypes = {
  tendencia: PropTypes.oneOf(["subindo", "descendo", "estável"]).isRequired,
};

const EstatisticaItem = ({ label, valor, unidade, darkMode }) => (
  <div className="flex justify-between items-center">
    <span className={darkMode ? "text-gray-400" : "text-gray-600"}>
      {label}
    </span>
    <span className="font-bold">
      {valor}
      {unidade}
    </span>
  </div>
);

EstatisticaItem.propTypes = {
  label: PropTypes.string.isRequired,
  valor: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  unidade: PropTypes.string.isRequired,
  darkMode: PropTypes.bool,
};

const BlocoEstatistica = ({ titulo, estatisticas, unidade, darkMode }) => (
  <div
    className={`p-4 rounded-xl ${darkMode ? "bg-gray-800/50" : "bg-blue-50"}`}
  >
    <h3
      className={`text-lg font-semibold mb-4 ${
        darkMode ? "text-indigo-300" : "text-blue-700"
      }`}
    >
      {titulo}
    </h3>
    <div className="space-y-3">
      <EstatisticaItem
        label="Mínima"
        valor={estatisticas.min}
        unidade={unidade}
        darkMode={darkMode}
      />
      <EstatisticaItem
        label="Máxima"
        valor={estatisticas.max}
        unidade={unidade}
        darkMode={darkMode}
      />
      <EstatisticaItem
        label="Média"
        valor={estatisticas.media}
        unidade={unidade}
        darkMode={darkMode}
      />
      <div className="flex justify-between items-center">
        <span className={darkMode ? "text-gray-400" : "text-gray-600"}>
          Tendência
        </span>
        <div className="flex items-center gap-2">
          <span className="font-medium">{estatisticas.tendencia}</span>
          <TendenciaIcon tendencia={estatisticas.tendencia} />
        </div>
      </div>
    </div>
  </div>
);

BlocoEstatistica.propTypes = {
  titulo: PropTypes.string.isRequired,
  estatisticas: PropTypes.shape({
    min: PropTypes.number.isRequired,
    max: PropTypes.number.isRequired,
    media: PropTypes.string.isRequired,
    tendencia: PropTypes.oneOf(["subindo", "descendo", "estável"]).isRequired,
  }).isRequired,
  unidade: PropTypes.string.isRequired,
  darkMode: PropTypes.bool,
};

const calcularEstatisticas = (data, campo) => {
  if (!data || data.length === 0)
    return { min: 0, max: 0, media: 0, tendencia: "estável" };

  const valores = data.map((d) => d[campo]);
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  const media = valores.reduce((a, b) => a + b, 0) / valores.length;

  const primeiro = valores[0];
  const ultimo = valores[valores.length - 1];
  let tendencia = "estável";
  if (ultimo > primeiro) tendencia = "subindo";
  if (ultimo < primeiro) tendencia = "descendo";

  return { min, max, media: media.toFixed(1), tendencia };
};

const HistoricoClima = ({ dados, darkMode }) => {
  const estatisticasTemp = calcularEstatisticas(dados, "temperatura");
  const estatisticasUmi = calcularEstatisticas(dados, "umidade");

  return (
    <div
      className={`rounded-2xl shadow-xl p-6 transition-all duration-300 ${
        darkMode
          ? "bg-gray-900/80 border-2 border-indigo-500/40 text-white"
          : "bg-white/80 border-2 border-blue-300/40 text-gray-800"
      }`}
    >
      <h2
        className={`text-2xl font-bold mb-6 ${
          darkMode ? "text-indigo-400" : "text-blue-600"
        }`}
      >
        Histórico e Estatísticas
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <BlocoEstatistica
          titulo="Temperatura"
          estatisticas={estatisticasTemp}
          unidade="°C"
          darkMode={darkMode}
        />
        <BlocoEstatistica
          titulo="Umidade"
          estatisticas={estatisticasUmi}
          unidade="%"
          darkMode={darkMode}
        />
      </div>

      {/* Gráfico de Histórico */}
      <div className="h-[300px] mt-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dados}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={darkMode ? "#374151" : "#94a3b8"}
              opacity={0.15}
            />
            <XAxis
              dataKey="nome"
              stroke={darkMode ? "#9ca3af" : "#475569"}
              style={{
                fontSize: "12px",
                fontWeight: "500",
              }}
            />
            <YAxis
              yAxisId="temp"
              stroke={darkMode ? "#93c5fd" : "#3b82f6"}
              style={{
                fontSize: "12px",
                fontWeight: "500",
              }}
            />
            <YAxis
              yAxisId="umidade"
              orientation="right"
              stroke={darkMode ? "#818cf8" : "#6366f1"}
              style={{
                fontSize: "12px",
                fontWeight: "500",
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: darkMode ? "#1f2937" : "#ffffff",
                border: "none",
                borderRadius: "0.5rem",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              labelStyle={{
                color: darkMode ? "#e5e7eb" : "#1f2937",
                fontWeight: "600",
              }}
            />
            <Legend />
            <Line
              yAxisId="temp"
              type="monotone"
              dataKey="temperatura"
              stroke={darkMode ? "#93c5fd" : "#3b82f6"}
              strokeWidth={2}
              dot={{
                stroke: darkMode ? "#93c5fd" : "#3b82f6",
                strokeWidth: 2,
                r: 4,
              }}
              activeDot={{
                stroke: darkMode ? "#93c5fd" : "#3b82f6",
                strokeWidth: 2,
                r: 6,
              }}
              name="Temperatura (°C)"
            />
            <Line
              yAxisId="umidade"
              type="monotone"
              dataKey="umidade"
              stroke={darkMode ? "#818cf8" : "#6366f1"}
              strokeWidth={2}
              dot={{
                stroke: darkMode ? "#818cf8" : "#6366f1",
                strokeWidth: 2,
                r: 4,
              }}
              activeDot={{
                stroke: darkMode ? "#818cf8" : "#6366f1",
                strokeWidth: 2,
                r: 6,
              }}
              name="Umidade (%)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

HistoricoClima.propTypes = {
  dados: PropTypes.arrayOf(
    PropTypes.shape({
      temperatura: PropTypes.number.isRequired,
      umidade: PropTypes.number.isRequired,
    })
  ),
  darkMode: PropTypes.bool,
};

export default HistoricoClima;
