const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");

dotenv.config();

const weatherRoutes = require("./routes/weatherRoutes.js");
const fireRoutes = require("./routes/fireRoutes");

const app = express();

app.use(helmet());
app.use(compression());
app.use(morgan(process.env.LOG_LEVEL || "combined"));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    status: 429,
    message: "Muitas requisições deste IP, tente novamente mais tarde.",
  },
});

app.use("/api/", limiter);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.setHeader("Content-Type", "application/json");
  next();
});

app.use("/api/weather", weatherRoutes);
app.use("/api/fires", fireRoutes);

app.get("/api/openmeteo/cuiaba", async (req, res, next) => {
  try {
    const url =
      "https://api.open-meteo.com/v1/forecast?latitude=-15.6014&longitude=-56.0979&current_weather=true";
    const response = await fetch(url);
    if (!response.ok) throw new Error("Erro ao buscar dados do Open-Meteo");
    const data = await response.json();
    res.json({ clima: data.current_weather });
  } catch (err) {
    next(err);
  }
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    env: process.env.NODE_ENV || "development",
  });
});

app.use((err, req, res, next) => {
  console.error("Erro:", err.message);
  console.error("Stack:", err.stack);

  const status = err.status || 500;
  const message = err.message || "Erro interno do servidor";

  res.status(status).json({
    error: {
      message,
      status,
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
    },
  });
});

app.use((req, res) => {
  res.status(404).json({
    error: {
      message: "Rota não encontrada",
      status: 404,
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
    },
  });
});

const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV || "development"}`);
  console.log(
    `URL do frontend: ${process.env.FRONTEND_URL || "http://localhost:5173"}`
  );
});

process.on("SIGTERM", () => {
  if (server) server.close(() => process.exit(0));
});
