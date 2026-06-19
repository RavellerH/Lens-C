import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Project site on GitHub Pages is served from /Lens-C/ (matching the repo
  // name's exact case), so built asset URLs need that prefix. Routing itself
  // uses HashRouter and is base-independent.
  base: '/Lens-C/',
})
