import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // GitHub Pages (Project Pages) でも正しく静的アセットを解決できるよう相対パス化
  base: './',
});
