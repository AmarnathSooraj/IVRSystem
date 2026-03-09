import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import basicSsl from "@vitejs/plugin-basic-ssl";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), basicSsl()],
  server: {
    https: true,
    host: true, // expose on local network (0.0.0.0)
    proxy: {
      "/token": "http://localhost:5000",
      "/incoming": "http://localhost:5000",
      "/menu": "http://localhost:5000",
      "/students": "http://localhost:5000",
    },
  },
});
