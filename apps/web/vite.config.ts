import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_PUBLIC_DEMO === "true" ? "./" : "/",
  server: { port: 5173 },
});
