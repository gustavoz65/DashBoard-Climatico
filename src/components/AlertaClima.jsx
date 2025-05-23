import React from "react";
import PropTypes from "prop-types";
import { AlertTriangle, Wind, Droplets, ThermometerSun, X } from "lucide-react";
import { TipoAlerta } from "../constants/alertaTypes";

const getAlertIcon = (tipo) => {
  switch (tipo) {
    case TipoAlerta.TEMPERATURA:
      return <ThermometerSun size={24} />;
    case TipoAlerta.UMIDADE:
      return <Droplets size={24} />;
    case TipoAlerta.QUALIDADE_AR:
      return <Wind size={24} />;
    default:
      return <AlertTriangle size={24} />;
  }
};

const getSeverityClass = (severidade, darkMode) => {
  const baseClasses = darkMode
    ? "border-opacity-50 bg-opacity-20"
    : "border-opacity-30 bg-opacity-10";

  switch (severidade) {
    case "alta":
      return `border-red-500 bg-red-500 text-red-700 dark:text-red-300 ${baseClasses}`;
    case "media":
      return `border-yellow-500 bg-yellow-500 text-yellow-700 dark:text-yellow-300 ${baseClasses}`;
    case "baixa":
      return `border-blue-500 bg-blue-500 text-blue-700 dark:text-blue-300 ${baseClasses}`;
    default:
      return `border-gray-500 bg-gray-500 text-gray-700 dark:text-gray-300 ${baseClasses}`;
  }
};

const AlertaClima = ({ alertas = [], onDismiss, darkMode }) => {
  if (!alertas?.length) return null;

  return (
    <div className="space-y-4">
      {alertas.map((alerta) => (
        <div
          key={alerta.id}
          className={`relative rounded-xl border-2 p-4 transition-all duration-300 ${getSeverityClass(
            alerta.severidade,
            darkMode
          )}`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`mt-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
            >
              {getAlertIcon(alerta.tipo)}
            </div>

            <div className="flex-1">
              <h4
                className={`font-bold ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {alerta.titulo}
              </h4>
              <p
                className={`mt-1 text-sm ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                {alerta.mensagem}
              </p>
              <div className="mt-2 flex items-center gap-4">
                <span
                  className={`text-xs ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {new Date(alerta.timestamp).toLocaleString()}
                </span>
                {alerta.cidade && (
                  <span
                    className={`text-xs font-medium ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {alerta.cidade}
                  </span>
                )}
              </div>
            </div>

            {onDismiss && (
              <button
                onClick={() => onDismiss(alerta.id)}
                className={`rounded p-1 transition-colors hover:bg-black/10 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
                aria-label="Dispensar alerta"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

AlertaClima.propTypes = {
  alertas: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      tipo: PropTypes.oneOf(Object.values(TipoAlerta)).isRequired,
      severidade: PropTypes.oneOf(["alta", "media", "baixa"]).isRequired,
      titulo: PropTypes.string.isRequired,
      mensagem: PropTypes.string.isRequired,
      timestamp: PropTypes.string.isRequired,
      cidade: PropTypes.string,
    })
  ),
  onDismiss: PropTypes.func,
  darkMode: PropTypes.bool,
};

export default AlertaClima;
