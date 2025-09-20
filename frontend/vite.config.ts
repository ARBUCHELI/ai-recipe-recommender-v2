import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-tabs', '@radix-ui/react-select'],
          charts: ['recharts'],
          ai: ['@huggingface/transformers']
        },
      },
    },
    chunkSizeWarningLimit: 1600,
    // Optimize for production
    target: 'esnext',
    minify: mode === 'production',
    sourcemap: mode === 'development',
  },
  // Environment variables
  envPrefix: 'VITE_',
}));
