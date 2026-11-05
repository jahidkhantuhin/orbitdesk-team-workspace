require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");

const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/tasks");

const app = express();
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5000")
  .split(",")
  .map((origin) => origin.trim());

if (!process.env.MONGODB_URI) {
  throw new Error(
    "MONGODB_URI must be configured before starting OrbitDesk API.",
  );
}
if (!process.env.JWT_SECRET) {
  throw new Error(
    "JWT_SECRET must be configured before starting OrbitDesk API.",
  );
}
if (Buffer.byteLength(process.env.JWT_SECRET, "utf8") < 32) {
  throw new Error("JWT_SECRET must contain at least 32 bytes.");
}

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (
    !origin ||
    allowedOrigins.includes("*") ||
    allowedOrigins.includes(origin)
  ) {
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
  }
  res.setHeader("Vary", "Origin");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json({ limit: "10kb" }));
app.use(authRoutes);
app.use(taskRoutes);

app.get("/health", (req, res) => {
  res.status(mongoose.connection.readyState === 1 ? 200 : 503).json({
    status: mongoose.connection.readyState === 1 ? "ok" : "starting",
  });
});

app.use((req, res) => {
  res.status(404).json({ message: "Endpoint not found." });
});

app.use((error, req, res, next) => {
  console.error(error);
  const status = error.statusCode || 500;
  const message =
    status === 500 ? "An unexpected error occurred." : error.message;
  res.status(status).json({ message, data: error.data });
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then((result) => {
    const port = Number(process.env.PORT) || 7070;
    const server = app.listen(port, () => {
      console.log(
        `${process.env.APP_NAME || "OrbitDesk"} API listening on port ${port}`,
      );
    });
    server.on("error", async (error) => {
      if (error.code === "EADDRINUSE") {
        console.error(
          `Port ${port} is already in use. Stop the other service or set a different PORT in .env.`,
        );
      } else {
        console.error("Could not start the OrbitDesk API:", error.message);
      }
      await mongoose.disconnect();
      process.exitCode = 1;
    });
  })
  .catch((err) => {
    console.error("Could not connect to MongoDB:", err.message);
    process.exitCode = 1;
  });
