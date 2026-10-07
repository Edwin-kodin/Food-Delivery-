import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
const backend = process.env.VITE_PROXY_TARGET || "http://127.0.0.1:4000";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": { target: backend, changeOrigin: true },
      "/food-images": { target: backend, changeOrigin: true },
    },
  },
});
