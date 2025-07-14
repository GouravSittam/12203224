import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    proxy: {
      "/shorturls": "http://localhost:3001",
      "/log": "http://localhost:3001",
      "/health": "http://localhost:3001",
    },
  },
});
