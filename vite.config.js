import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react(), tailwindcss()],
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./src/test/setup.js",
      css: true,
    },
  };
});
