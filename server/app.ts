import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { createServer } from "http";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";

const app = express();

// ==========================================
// SECURITY HEADERS (Helmet)
// ==========================================
app.use(helmet({
  contentSecurityPolicy: false,
}));

// ==========================================
// CORS
// ==========================================
const allowedOrigins = process.env.APP_URL
  ? [process.env.APP_URL]
  : process.env.NODE_ENV === "production"
    ? []
    : ["http://localhost:5001", "http://localhost:5173"];

app.use(cors({
  origin: allowedOrigins.length > 0
    ? allowedOrigins
    : false,
  credentials: true,
}));

// ==========================================
// RATE LIMITING
// ==========================================

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path.startsWith("/api/webhooks"),
});

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Too many requests for this endpoint. Please wait before trying again." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", generalLimiter);
app.use("/api/assessment", strictLimiter);

// ==========================================
// BODY PARSING
// ==========================================

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

// ==========================================
// REQUEST LOGGING
// ==========================================

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

// ==========================================
// ROUTE REGISTRATION + STATIC SERVING
// ==========================================

const httpServer = createServer(app);

const initPromise = (async () => {
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Vercel CDN handles static files — only serve locally
  if (process.env.NODE_ENV === "production" && !process.env.VERCEL) {
    serveStatic(app);
  }
})();

export { app, httpServer, initPromise };
