import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  build: {
    outDir: "dist/client",
  },
  optimizeDeps: {
    include: ["react", "react-dom/client"],
  },
  server: {
    proxy: { "/api": process.env.WORKBASE_DEV_ORIGIN || "http://127.0.0.1:14310", "/v": process.env.WORKBASE_DEV_ORIGIN || "http://127.0.0.1:14310", "/static": process.env.WORKBASE_DEV_ORIGIN || "http://127.0.0.1:14310" },
    host: "0.0.0.0",
    allowedHosts: ["terminal.local"],
    warmup: {
      clientFiles: ["./src/main.jsx"],
    },
  },
  plugins: [react()],
});
