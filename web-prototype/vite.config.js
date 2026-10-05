import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  base: './', // Enables seamless deployment to GitHub Pages / Cloudflare Workers
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      input: {
        game: fileURLToPath(new URL('./index.html', import.meta.url)),
        showroom: fileURLToPath(new URL('./showroom.html', import.meta.url))
      },
      output: {
        manualChunks(id) {
          if (id.includes('three')) {
            return 'three-vendor';
          }
        }
      }
    }
  },
  server: {
    port: 3000,
    host: true
  }
});
