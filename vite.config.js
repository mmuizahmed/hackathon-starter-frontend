import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Browser calls stay on this app's origin (`/api/...`).
// In dev, Vite forwards them to the Express server.
// In production, vercel.json does the same job.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
