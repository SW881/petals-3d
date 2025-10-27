import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        port: 3000,
    },
    build: {
        sourcemap: false, // Disable source maps (prevents code mapping exposure)
        minify: 'esbuild', // Fast and compact builds
        target: 'es2017', // Modern JS target
        outDir: 'dist',
    },
})
