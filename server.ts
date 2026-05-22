import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import path from "path";
import { createServer as createViteServer } from "vite";
import duaRoutes from "./routes/duaRoutes.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // 1. Enable CORS for multi-platform / mobile app friendship and cross-origin access
  app.use(cors());

  // 2. Parse incoming JSON and urlencoded requests
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // 3. Health Check Endpoints
  const healthHandler = (req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      status: "healthy",
      timestamp: new Date().toISOString(),
      message: "Islamic Dua REST API is fully operational and server-ready.",
      environment: process.env.NODE_ENV || "development"
    });
  };
  app.get("/health", healthHandler);
  app.get("/api/health", healthHandler);

  // 4. Mount target Dua API endpoints
  app.use("/api", duaRoutes);

  // 5. Setup Interactive Developer UI / Dashboard (Vite Frontend Integration)
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting developer environment with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting production environment serving static files...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // 6. Global Error Handler Middleware
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error("Unhandle server exception:", err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || "An unexpected error occurred in the server.",
      error: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
  });

  // 7. Start listening on 3000 and bind to 0.0.0.0 (Container Requirement)
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Critical: Dev Server failed to boot:", error);
});
