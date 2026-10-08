import app from "./app";

/**
 * Server Entry Point
 * 
 * Starts the HTTP server on the configured port.
 * Default port: 3000 (can be overridden with PORT env variable)
 */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API Documentation: http://localhost:${PORT}/api/incidents`);
});
