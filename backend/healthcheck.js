const http = require("http");

const options = {
  host: "localhost",
  port: process.env.PORT || 8080,
  path: "/health",
  timeout: 2000,
};

const request = http.request(options, (res) => {
  console.log(`HEALTHCHECK STATUS: ${res.statusCode}`);
  process.exit(res.statusCode === 200 ? 0 : 1);
});

request.on("error", (err) => {
  console.error("HEALTHCHECK ERROR:", err.message);
  process.exit(1);
});

request.end();

module.exports = request;
