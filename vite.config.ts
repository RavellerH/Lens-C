import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Project site on GitHub Pages is served from /lens-c/, so built asset URLs
  // need that prefix. Routing itself uses HashRouter and is base-independent.
  base: '/lens-c/',
})
