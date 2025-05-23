import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  MapContainer,
  TileLayer,
  Popup,
  CircleMarker,
  LayersControl,
  ZoomControl,
} from "react-leaflet";
import { classificarQualidadeAr } from "../data/cidadesMT";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Corrigir ícone do Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const MapaClima = ({
  cidades = [],
  dados = { temperatura: {}, umidade: {}, qualidadeAr: {} },
  setCidadeSelecionada,
  cidadeSelecionada,
  darkMode,
}) => {
  const [mapType, setMapType] = useState("street");

  // Função para cor do marcador
  const getMarkerColor = (qualidadeAr) => {
    if (qualidadeAr <= 50) return "#00e400"; // Boa
    if (qualidadeAr <= 100) return "#ffff00"; // Moderada
    if (qualidadeAr <= 150) return "#ff7e00"; // Ruim para grupos sensíveis
    if (qualidadeAr <= 200) return "#ff0000"; // Ruim
    return "#8f3f97"; // Muito ruim
  };

  // Configurações dos tipos de mapa
  const mapStyles = {
    street: {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    },
    satellite: {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attribution:
        "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
    },
    terrain: {
      url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
      attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
    },
    dark: {
      url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    },
  };

  const markers = useMemo(() => {
    if (!Array.isArray(cidades) || cidades.length === 0) return null;
    return cidades.map((cidade) => {
      if (typeof cidade.lat !== "number" || typeof cidade.lon !== "number")
        return null;
      const temp = dados.temperatura?.[cidade.nome]?.[0] ?? "--";
      const umi = dados.umidade?.[cidade.nome]?.[0] ?? "--";
      const iqa = dados.qualidadeAr?.[cidade.nome] ?? "--";
      const qualidade = classificarQualidadeAr(iqa);
      const isSelected = cidade.nome === cidadeSelecionada;

      return (
        <CircleMarker
          key={cidade.nome}
          center={[cidade.lat, cidade.lon]}
          pathOptions={{
            color: getMarkerColor(iqa),
            fillColor: getMarkerColor(iqa),
            fillOpacity: isSelected ? 1 : 0.7,
            radius: isSelected ? 15 : 10,
            weight: isSelected ? 3 : 2,
          }}
          eventHandlers={{
            click: () => setCidadeSelecionada(cidade.nome),
          }}
        >
          <Popup>
            <div
              className={`p-4 rounded-lg transition-all duration-300 ${
                darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-800"
              }`}
            >
              <h3 className="font-bold text-lg mb-3">{cidade.nome}</h3>
              <div className="space-y-2">
                <p className="flex justify-between items-center">
                  <span
                    className={darkMode ? "text-gray-400" : "text-gray-600"}
                  >
                    Temperatura:
                  </span>
                  <span className="font-semibold text-lg">{temp}°C</span>
                </p>
                <p className="flex justify-between items-center">
                  <span
                    className={darkMode ? "text-gray-400" : "text-gray-600"}
                  >
                    Umidade:
                  </span>
                  <span className="font-semibold text-lg">{umi}%</span>
                </p>
                <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                <p className="flex justify-between items-center">
                  <span
                    className={darkMode ? "text-gray-400" : "text-gray-600"}
                  >
                    Qualidade do Ar:
                  </span>
                  <span className={`font-semibold ${qualidade.classe}`}>
                    {qualidade.texto}
                  </span>
                </p>
                <p className="text-center mt-2">
                  <span
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    IQA: {iqa}
                  </span>
                </p>
              </div>
            </div>
          </Popup>
        </CircleMarker>
      );
    });
  }, [cidades, dados, cidadeSelecionada, setCidadeSelecionada, darkMode]);

  const center =
    cidades.length > 0 &&
    typeof cidades[0].lat === "number" &&
    typeof cidades[0].lon === "number"
      ? [cidades[0].lat, cidades[0].lon]
      : [-15.601, -56.097];

  return (
    <MapContainer
      center={center}
      zoom={12}
      scrollWheelZoom={true}
      className="h-96 rounded-lg shadow-lg"
      zoomControl={false}
    >
      <ZoomControl position="bottomright" />
      <LayersControl position="topright">
        <LayersControl.BaseLayer checked={mapType === "street"} name="Ruas">
          <TileLayer
            url={mapStyles.street.url}
            attribution={mapStyles.street.attribution}
            onChange={() => setMapType("street")}
          />
        </LayersControl.BaseLayer>

        <LayersControl.BaseLayer
          checked={mapType === "satellite"}
          name="Satélite"
        >
          <TileLayer
            url={mapStyles.satellite.url}
            attribution={mapStyles.satellite.attribution}
            onChange={() => setMapType("satellite")}
          />
        </LayersControl.BaseLayer>

        <LayersControl.BaseLayer checked={mapType === "terrain"} name="Terreno">
          <TileLayer
            url={mapStyles.terrain.url}
            attribution={mapStyles.terrain.attribution}
            onChange={() => setMapType("terrain")}
          />
        </LayersControl.BaseLayer>

        <LayersControl.BaseLayer checked={mapType === "dark"} name="Escuro">
          <TileLayer
            url={mapStyles.dark.url}
            attribution={mapStyles.dark.attribution}
            onChange={() => setMapType("dark")}
          />
        </LayersControl.BaseLayer>
      </LayersControl>
      {markers}
    </MapContainer>
  );
};

MapaClima.propTypes = {
  cidades: PropTypes.arrayOf(
    PropTypes.shape({
      nome: PropTypes.string.isRequired,
      lat: PropTypes.number,
      lon: PropTypes.number,
      id: PropTypes.any,
    })
  ).isRequired,
  dados: PropTypes.shape({
    temperatura: PropTypes.object.isRequired,
    umidade: PropTypes.object.isRequired,
    qualidadeAr: PropTypes.object.isRequired,
  }).isRequired,
  setCidadeSelecionada: PropTypes.func.isRequired,
  cidadeSelecionada: PropTypes.string,
  darkMode: PropTypes.bool,
};

MapaClima.defaultProps = {
  darkMode: false,
};

export default MapaClima;
