// backend/config/index.js
const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  app: {
    name: "Dashboard Clima MT API",
    port: process.env.PORT || 8080,
    env: process.env.NODE_ENV || "development",
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  },

  database: {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "firewatch",
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0,
  },

  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || "",
    ttl: 300, // 5 minutos padrão
  },

  apis: {
    openWeather: {
      key: process.env.OPENWEATHER_API_KEY,
      baseUrl: "https://api.openweathermap.org/data/2.5",
      units: "metric",
      lang: "pt_br",
    },
    firms: {
      key: process.env.FIRMS_API_KEY,
      baseUrl: "https://firms.modaps.eosdis.nasa.gov/api",
      area: "world",
      dayRange: 1,
    },
    googleMaps: {
      key: process.env.GOOGLE_MAPS_KEY,
    },
  },

  jobs: {
    fetchInterval: parseInt(process.env.FETCH_INTERVAL_MINUTES) || 15,
    retryAttempts: 3,
    retryDelay: 5000, // 5 segundos
  },

  security: {
    jwtSecret: process.env.JWT_SECRET || "change-this-secret",
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
    bcryptRounds: 10,
    corsOptions: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      credentials: true,
      optionsSuccessStatus: 200,
    },
  },

  logging: {
    level: process.env.LOG_LEVEL || "info",
    format: "combined",
    directory: "./logs",
    maxSize: "20m",
    maxFiles: "14d",
  },

  email: {
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  },
};
