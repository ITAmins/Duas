/**
 * Islamic Dua REST API Server
 * Standalone Node.js Express server with CORS & proper encoding
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import duaRoutes from './routes/duaRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Enable Cross-Origin Resource Sharing (CORS) - Mobile-friendly & Web-safe
app.use(cors());

// Body parser middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve API documentation index on root GET /
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: "Welcome to the Islamic Dua REST API!",
    version: "1.0.0",
    encoding: "UTF-8",
    developer_note: "We support Bangla & Arabic encoding out of the box.",
    endpoints: {
      all_duas: "/api/duas",
      dua_by_id: "/api/duas/:id (e.g., /api/duas/1)",
      duas_by_category: "/api/category/:name (e.g., /api/category/Sleep)",
      random_dua: "/api/random",
      search_duas: "/api/search?q=query_term (e.g., /api/search?q=ঘুম)",
      health_check: "/health"
    },
    sample_queries: {
      search_sleeping_dua: "/api/search?q=ঘুমানোর",
      get_first_dua: "/api/duas/1",
      get_random: "/api/random"
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString()
  });
});

// Mount Dua API routes
app.use('/api', duaRoutes);

// 404 Routing handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.originalUrl}. Refer to API documentation at root /.`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Express App Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "An unexpected internal server error occurred."
  });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Islamic-Dua-API] Running cleanly on port ${PORT}`);
  console.log(`[Islamic-Dua-API] Local Dev URL: http://localhost:${PORT}`);
});
