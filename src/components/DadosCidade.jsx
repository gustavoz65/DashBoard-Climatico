import React from "react";
import PropTypes from "prop-types";
import { Sun, Wind, Droplets, AlertTriangle } from "lucide-react";
import { classificarQualidadeAr } from "../data/cidadesMT";

const DadosCidade = ({
  cidade,
  temperatura,
  umidade,
  qualidadeAr,
  darkMode,
}) => {
  const avaliacaoAr = classificarQualidadeAr(qualidadeAr);

  return (
    <div
      className={`p-6 rounded-2xl transition-all duration-300 border-2 shadow-xl hover:scale-[1.02] ${
        darkMode
          ? "bg-gray-900/80 border-indigo-500/40 text-white"
          : "bg-white/80 border-blue-300/40 text-gray-800"
      }`}
    >
      <h3
        className={`font-bold text-xl mb-4 ${
          darkMode ? "text-indigo-300" : "text-blue-600"
        }`}
      >
        {cidade}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="flex items-center gap-3">
          <div
            className={`p-3 rounded-xl ${
              darkMode ? "bg-indigo-900/50" : "bg-blue-100"
            }`}
          >
            <Sun
              className={darkMode ? "text-yellow-400" : "text-yellow-500"}
              size={28}
            />
          </div>
          <div>
            <p
              className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Temperatura
            </p>
            <p className="text-2xl font-bold">{temperatura}°C</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`p-3 rounded-xl ${
              darkMode ? "bg-indigo-900/50" : "bg-blue-100"
            }`}
          >
            <Droplets
              className={darkMode ? "text-indigo-400" : "text-blue-500"}
              size={28}
            />
          </div>
          <div>
            <p
              className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Umidade
            </p>
            <p className="text-2xl font-bold">{umidade}%</p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:col-span-2">
          <div
            className={`p-3 rounded-xl ${
              darkMode ? "bg-indigo-900/50" : "bg-blue-100"
            }`}
          >
            <Wind
              className={darkMode ? "text-purple-400" : "text-gray-500"}
              size={28}
            />
          </div>
          <div>
            <p
              className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Qualidade do Ar
            </p>
            <p className={`text-xl font-bold ${avaliacaoAr.classe}`}>
              {avaliacaoAr.texto} ({qualidadeAr})
            </p>
          </div>
        </div>
      </div>

      {qualidadeAr > 100 && (
        <div
          className={`mt-6 p-4 rounded-xl flex items-center gap-3 ${
            darkMode ? "bg-red-900/30 border border-red-500/30" : "bg-red-100"
          }`}
        >
          <AlertTriangle className="text-red-500" size={24} />
          <p
            className={`font-medium ${
              darkMode ? "text-red-400" : "text-red-600"
            }`}
          >
            Qualidade do ar em níveis preocupantes!
          </p>
        </div>
      )}
    </div>
  );
};

DadosCidade.propTypes = {
  cidade: PropTypes.string.isRequired,
  temperatura: PropTypes.number.isRequired,
  umidade: PropTypes.number.isRequired,
  qualidadeAr: PropTypes.number.isRequired,
  darkMode: PropTypes.bool,
};

DadosCidade.defaultProps = {
  darkMode: false,
};

export default DadosCidade;
