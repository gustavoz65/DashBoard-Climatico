// backend/utils/logger.js
const winston = require("winston");
const path = require("path");
const fs = require("fs");
const config = require("../config");

// Criar diretório de logs se não existir
const logDir = config.logging.directory || "./logs";
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Formato customizado para logs
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.printf(({ timestamp, level, message, stack, ...metadata }) => {
    let formattedTimestamp;
    if (typeof timestamp === "string") {
      formattedTimestamp = timestamp;
    } else if (
      timestamp instanceof Date &&
      typeof timestamp.toISOString === "function"
    ) {
      formattedTimestamp = timestamp.toISOString();
    } else if (typeof timestamp === "number") {
      formattedTimestamp = new Date(timestamp).toISOString();
    } else if (timestamp && typeof timestamp === "object") {
      formattedTimestamp = JSON.stringify(timestamp);
    } else {
      // Fallback: safely stringify unknown timestamp types
      formattedTimestamp = JSON.stringify(timestamp);
    }
    let msg;
    if (typeof message === "object") {
      msg = `${formattedTimestamp} [${level.toUpperCase()}]: ${JSON.stringify(
        message
      )}`;
    } else {
      msg = `${formattedTimestamp} [${level.toUpperCase()}]: ${
        typeof message === "string" ? message : JSON.stringify(message)
      }`;
    }

    if (Object.keys(metadata).length > 0) {
      msg += ` ${JSON.stringify(metadata)}`;
    }

    if (stack) {
      msg += `\n${typeof stack === "string" ? stack : JSON.stringify(stack)}`;
    }

    return msg;
  })
);

// Configurar transportes
const transports = [
  // Console
  new winston.transports.Console({
    format: winston.format.combine(winston.format.colorize(), customFormat),
  }),
];

// Adicionar arquivo de log em produção
if (process.env.NODE_ENV === "production") {
  transports.push(
    // Arquivo para todos os logs
    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
      maxsize: config.logging.maxSize || "20m",
      maxFiles: config.logging.maxFiles || "14d",
      format: customFormat,
    }),
    // Arquivo separado para erros
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
      maxsize: config.logging.maxSize || "20m",
      maxFiles: config.logging.maxFiles || "14d",
      format: customFormat,
    })
  );
}

// Criar logger
const logger = winston.createLogger({
  level: config.logging.level || "info",
  transports,
  exitOnError: false,
});

// Stream para Morgan
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

// Métodos auxiliares
logger.logRequest = (req, res, responseTime) => {
  const logData = {
    method: req.method,
    url: req.url,
    status: res.statusCode,
    responseTime: `${responseTime}ms`,
    ip: req.ip,
    userAgent: req.get("user-agent"),
  };

  if (res.statusCode >= 400) {
    logger.error("Request failed", logData);
  } else {
    logger.info("Request completed", logData);
  }
};

logger.logError = (err, req = null) => {
  const errorData = {
    message: err.message,
    stack: err.stack,
    code: err.code || "UNKNOWN_ERROR",
  };

  if (req) {
    errorData.request = {
      method: req.method,
      url: req.url,
      body: req.body,
      ip: req.ip,
    };
  }

  logger.error("Application error", errorData);
};

// Log de inicialização
logger.info("Logger initialized", {
  environment: process.env.NODE_ENV || "development",
  logLevel: config.logging.level || "info",
});

module.exports = logger;
