import 'dotenv/config';
import { createServer } from "http";
import app, { log } from "./app";
import { serveStatic } from "./static";

// ==========================================
// SERVER STARTUP (Local / Dedicated)
// ==========================================
(async () => {
  const httpServer = createServer(app);

  // We already registered routes in app.ts, but registerRoutes might invoke some side-effects
  // that technically "attach" things?
  // However, looking at registerRoutes implementation, it just does app.post/get.
  // Those are already run when `import app` ran because `registerRoutes(app)` is called in `app.ts`.
  // Wait! In `app.ts` I called `registerRoutes(app)`.
  // If `registerRoutes` is safe to call twice (idempotent paths), fine.
  // But usually it's better to NOT call it in `app.ts` if we want to pass `httpServer` in `index.ts`.

  // Actually, Vercel needs routes registered. So `app.ts` MUST call `registerRoutes`.
  // But `index.ts` has `httpServer`.
  // If `routes.ts` doesn't use `httpServer`, it DOES NOT MATTER.

  // Error handling middleware
  app.use((err: any, _req: any, res: any, _next: any) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Setup Vite or Static serving
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // Start Server
  const port = parseInt(process.env.PORT || "5001", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
