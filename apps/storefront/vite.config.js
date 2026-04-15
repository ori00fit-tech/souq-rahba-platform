import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;

          if (id.includes("react") || id.includes("react-dom") || id.includes("scheduler")) {
            return "react-vendor";
          }

          if (id.includes("react-router") || id.includes("@remix-run")) {
            return "router-vendor";
          }

          return "vendor";
        },
      },
    },
  },
});
