import React, { useMemo, useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  MapContainer,
  TileLayer,
  Popup,
  CircleMarker,
  LayersControl,
  ZoomControl,
  useMap,
} from "react-leaflet";
import { classificarQualidadeAr } from "../data/cidadesMT";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function getCustomIcon({ temChuva, darkMode, isSelected, cor }) {
  if (!temChuva) return undefined;
  const svg = `
    <svg width='40' height='24' viewBox='0 0 40 24' style='position:absolute;top:-28px;left:50%;transform:translateX(-50%);z-index:2;pointer-events:none;'>
      <g>
        <ellipse cx='20' cy='16' rx='16' ry='8' fill='${
          darkMode ? "#64748b" : "#cbd5e1"
        }' opacity='0.7'>
          <animate attributeName='cx' values='18;22;18' dur='2s' repeatCount='indefinite'/>
        </ellipse>
        <ellipse cx='28' cy='14' rx='8' ry='5' fill='${
          darkMode ? "#475569" : "#e0e7ef"
        }' opacity='0.6'>
          <animate attributeName='cx' values='26;30;26' dur='2s' repeatCount='indefinite'/>
        </ellipse>
      </g>
    </svg>
  `;
  const circle = `<div style='width:${isSelected ? 30 : 20}px;height:${
    isSelected ? 30 : 20
  }px;border-radius:50%;background:${cor};border:2px solid #222;box-shadow:0 2px 8px #0003;position:relative;z-index:1;'></div>`;
  return L.divIcon({
    className: "",
    html: svg + circle,
    iconSize: [isSelected ? 30 : 20, isSelected ? 54 : 44],
    iconAnchor: [isSelected ? 15 : 10, isSelected ? 30 : 20],
    popupAnchor: [0, -30],
  });
}

const MapaClima = ({
  cidades = [],
  dados = { temperatura: {}, umidade: {}, qualidadeAr: {} },
  setCidadeSelecionada,
  cidadeSelecionada,
  darkMode,
}) => {
  const [mapType, setMapType] = useState("street");

  const getMarkerColor = (qualidadeAr) => {
    if (qualidadeAr <= 50) return "#00e400";
    if (qualidadeAr <= 100) return "#ffff00";
    if (qualidadeAr <= 150) return "#ff7e00";
    if (qualidadeAr <= 200) return "#ff0000";
    return "#8f3f97";
  };

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

  const ChangeView = ({ center }) => {
    const map = useMap();
    useEffect(() => {
      if (Array.isArray(center) && center.length === 2) {
        map.setView(center);
      }
    }, [center, map]);
    return null;
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
      const temChuva = dados.chuva?.[cidade.nome];
      const cor = getMarkerColor(iqa);
      const customIcon = getCustomIcon({ temChuva, darkMode, isSelected, cor });
      return (
        <CircleMarker
          key={cidade.nome}
          center={[cidade.lat, cidade.lon]}
          pathOptions={{
            color: cor,
            fillColor: cor,
            fillOpacity: isSelected ? 1 : 0.7,
            radius: isSelected ? 15 : 10,
            weight: isSelected ? 3 : 2,
          }}
          eventHandlers={{
            click: () => setCidadeSelecionada(cidade.nome),
          }}
          icon={customIcon}
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
      <ChangeView center={center} />
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
