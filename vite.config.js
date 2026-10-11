import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  // Relative asset paths so the build works at a domain root or under a sub-path (GitHub Pages).
  base: './',
  build: {
    target: 'es2020',
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        accessibility: resolve(import.meta.dirname, 'accessibility.html'),
      },
    },
  },
});
