import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { registerRoutes } from "./routes";

const app = express();

// Vercel runs behind a reverse proxy — required for correct IP in rate limiting
app.set("trust proxy", 1);

// ==========================================
// SECURITY HEADERS (Helmet)
// ==========================================
app.use(helmet({
  contentSecurityPolicy: false, // Disabled — Gumroad overlay requires inline scripts/iframes
  crossOriginResourcePolicy: { policy: "same-site" }, // allow subdomains (mobile compat)
  hsts: { maxAge: 31536000, includeSubDomains: true }, // 1 year — site is HTTPS-only
}));

// CSRF: Not applicable — stateless JSON API with no cookie-based auth.
// All mutations use POST with JSON body; Gumroad webhook verified by seller_id.

// ==========================================
// CORS
// ==========================================
const allowedOrigins = process.env.APP_URL
  ? [process.env.APP_URL]
  : process.env.NODE_ENV === "production"
    ? [] // Production: same-origin only (if APP_URL not set)
    : ["http://localhost:5001", "http://localhost:5173", "http://127.0.0.1:5173"];

app.use(cors({
  origin: allowedOrigins.length > 0
    ? allowedOrigins
    : false, // false = cross-origin blocked
  credentials: true,
}));

// ==========================================
// RATE LIMITING
// ==========================================

// General API rate limit: 100 requests per 15 minutes per IP
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path.startsWith("/api/webhooks"), // Skip webhooks
});

// Strict rate limit for heavy endpoints: 10 requests per 15 minutes per IP
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Too many requests for this endpoint. Please wait before trying again." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limit: unlock codes — 5 per 15 min
const codeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: "Too many code attempts. Please wait before trying again." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limit: resend report link — 3 per 15 min
const resendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: { error: "Too many resend requests. Please wait before trying again." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply general rate limiting to all /api routes (except webhooks)
app.use("/api", generalLimiter);

// Apply strict rate limiting to heavy endpoints
app.use("/api/assessment", strictLimiter); // Report generation
app.use("/api/codes", codeLimiter); // Code validate/redeem
app.use("/api/resend-report-link", resendLimiter); // Email resend

// JSON Body Parser with raw body verification (for webhooks)
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

// Logging Helper
export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

// Request Logger
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

// Register routes (No httpServer passed - Vercel compatible)
// Note: We register routes here for the app instance.
// If actual httpServer is needed for WebSockets, it should be attached separately.
registerRoutes(app);

export default app;
