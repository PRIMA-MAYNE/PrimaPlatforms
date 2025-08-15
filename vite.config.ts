import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 5173,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          ui: ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu"],
          charts: ["recharts"],
          export: ["jspdf", "docx", "exceljs", "file-saver"],
          router: ["react-router-dom"],
        },
      },
      external: mode === 'production' ? [] : undefined,
    },
    chunkSizeWarningLimit: 2000,
    target: "esnext",
    minify: "esbuild",
    sourcemap: false,
    commonjsOptions: {
      include: [/jspdf/, /docx/, /exceljs/, /file-saver/],
    },
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "jspdf",
      "docx",
      "exceljs",
      "file-saver",
    ],
    force: true,
  },
  define: {
    global: 'globalThis',
  },
}));
