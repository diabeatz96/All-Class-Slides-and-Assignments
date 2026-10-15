import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'node:path';

// Multi-page build so every booth is its own page.
// The Tailwind plugin is what turns class names like "bg-red-500" into real CSS.
export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        ringToss: resolve(import.meta.dirname, 'ring-toss/index.html'),
        funHouse: resolve(import.meta.dirname, 'fun-house/index.html'),
        safetyInspector: resolve(import.meta.dirname, 'safety-inspector/index.html'),
        yourBooth: resolve(import.meta.dirname, 'your-booth/index.html'),
      },
    },
  },
});
