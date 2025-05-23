import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

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
  base: process.env.NODE_ENV === "production" ? "/DashBoard-Climatico/" : "/",
});
