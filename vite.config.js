import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ["uuid"],
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  base: "/DashBoard-Climatico/", // nome do repositório
});
