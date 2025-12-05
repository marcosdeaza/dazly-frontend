import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
// (Importación de lovable-tagger eliminada)

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()].filter(Boolean), // <-- LÍNEA MODIFICADA
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));