import React from "react";
import PropTypes from "prop-types";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

const CustomTooltip = ({ active, payload, label, cor, dataKey, darkMode }) => {
  if (!active || !payload?.length) return null;

  const isTemperatura = dataKey === "temperatura";
  const dataLabel = isTemperatura ? "Temperatura" : "Umidade";
  const unit = isTemperatura ? "°C" : "%";
  const description = isTemperatura
    ? "Dados de temperatura em graus Celsius"
    : "Umidade relativa do ar em porcentagem";

  return (
    <div
      className={`backdrop-blur-xl p-4 rounded-xl shadow-2xl border-2 animate-scale-in transition-all duration-300 ${
        darkMode
          ? "bg-gray-900/90 border-indigo-500/40"
          : "bg-white/90 border-cyan-300/40"
      }`}
    >
      <p
        className={`font-bold text-xl mb-3 bg-gradient-to-r bg-clip-text text-transparent ${
          darkMode ? "from-indigo-400 to-blue-400" : "from-cyan-600 to-blue-600"
        }`}
      >
        {label}
      </p>
      <div className="space-y-2">
        <p className="text-base flex items-center gap-3" style={{ color: cor }}>
          <span
            className="w-4 h-4 rounded-full animate-pulse-slow"
            style={{ backgroundColor: cor }}
          ></span>
          <span
            className={`flex-1 ${darkMode ? "text-gray-300" : "text-gray-600"}`}
          >
            {dataLabel}:
          </span>
          <span
            className={`font-bold text-lg ${
              darkMode ? "text-white" : "text-gray-800"
            }`}
          >
            {payload[0].value}
            {unit}
          </span>
        </p>
        <p
          className={`text-xs mt-2 ${
            darkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          {description}
        </p>
      </div>
    </div>
  );
};

CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    })
  ),
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  cor: PropTypes.string.isRequired,
  dataKey: PropTypes.oneOf(["temperatura", "umidade"]).isRequired,
  darkMode: PropTypes.bool,
};

// Componente para renderizar a área do gráfico
const GraficoArea = ({
  dados,
  dataKey,
  cor,
  gradientId,
  darkMode,
  numericDominio,
}) => (
  <ResponsiveContainer width="100%" height={300}>
    <AreaChart data={dados}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={cor} stopOpacity={0.8} />
          <stop offset="95%" stopColor={cor} stopOpacity={0.1} />
        </linearGradient>
      </defs>
      <CartesianGrid
        strokeDasharray="3 3"
        stroke={darkMode ? "#374151" : "#e5e7eb"}
      />
      <XAxis dataKey="hora" stroke={darkMode ? "#9ca3af" : "#4b5563"} />
      <YAxis
        domain={numericDominio}
        stroke={darkMode ? "#9ca3af" : "#4b5563"}
      />
      <Tooltip
        content={
          <CustomTooltip cor={cor} dataKey={dataKey} darkMode={darkMode} />
        }
      />
      <Area
        type="monotone"
        dataKey={dataKey}
        stroke={cor}
        fill={`url(#${gradientId})`}
      />
    </AreaChart>
  </ResponsiveContainer>
);

// Componente para renderizar a linha do gráfico
const GraficoLinha = ({ dados, dataKey, cor, numericDominio, darkMode }) => (
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={dados}>
      <CartesianGrid
        strokeDasharray="3 3"
        stroke={darkMode ? "#374151" : "#e5e7eb"}
      />
      <XAxis dataKey="hora" stroke={darkMode ? "#9ca3af" : "#4b5563"} />
      <YAxis
        domain={numericDominio}
        stroke={darkMode ? "#9ca3af" : "#4b5563"}
      />
      <Tooltip
        content={
          <CustomTooltip cor={cor} dataKey={dataKey} darkMode={darkMode} />
        }
      />
      <Line
        type="monotone"
        dataKey={dataKey}
        stroke={cor}
        strokeWidth={2}
        dot={{ stroke: cor, strokeWidth: 2, r: 4 }}
        activeDot={{ r: 6, strokeWidth: 2 }}
      />
    </LineChart>
  </ResponsiveContainer>
);

const GraficoClima = ({
  titulo,
  dados,
  dataKey,
  cor,
  dominio,
  tipo = "linha",
  darkMode,
}) => {
  const numericDominio = dominio.map(Number);
  const gradientId = `gradient-${dataKey}`;

  return (
    <div
      className={`rounded-2xl shadow-xl p-6 transition-all duration-300 ${
        darkMode
          ? "bg-gray-900/80 border-2 border-indigo-500/40"
          : "bg-white/80 border-2 border-blue-300/40"
      }`}
    >
      <h3
        className={`text-xl font-bold mb-4 ${
          darkMode ? "text-indigo-400" : "text-blue-600"
        }`}
      >
        {titulo}
      </h3>

      {tipo === "area" ? (
        <GraficoArea
          dados={dados}
          dataKey={dataKey}
          cor={cor}
          gradientId={gradientId}
          darkMode={darkMode}
          numericDominio={numericDominio}
        />
      ) : (
        <GraficoLinha
          dados={dados}
          dataKey={dataKey}
          cor={cor}
          numericDominio={numericDominio}
          darkMode={darkMode}
        />
      )}
    </div>
  );
};

// PropTypes para os subcomponentes
const sharedPropTypes = {
  dados: PropTypes.arrayOf(PropTypes.object).isRequired,
  dataKey: PropTypes.oneOf(["temperatura", "umidade"]).isRequired,
  cor: PropTypes.string.isRequired,
  darkMode: PropTypes.bool,
  numericDominio: PropTypes.arrayOf(PropTypes.number).isRequired,
};

GraficoArea.propTypes = {
  ...sharedPropTypes,
  gradientId: PropTypes.string.isRequired,
};

GraficoLinha.propTypes = {
  ...sharedPropTypes,
};

GraficoClima.propTypes = {
  titulo: PropTypes.string.isRequired,
  dados: PropTypes.arrayOf(PropTypes.object).isRequired,
  dataKey: PropTypes.oneOf(["temperatura", "umidade"]).isRequired,
  cor: PropTypes.string.isRequired,
  dominio: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  ).isRequired,
  tipo: PropTypes.oneOf(["linha", "area"]),
  darkMode: PropTypes.bool,
};

GraficoClima.defaultProps = {
  tipo: "linha",
  darkMode: false,
};

export default GraficoClima;
