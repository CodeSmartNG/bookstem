import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    base: '/bookstem/', // Use this for GitHub Pages
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'esbuild',
      // Remove react-router-dom from external
      rollupOptions: {
        external: [] // Keep empty or only externalize truly external libs
      }
    },
    server: {
      port: 3000,
      open: true
    },
    define: {
      'process.env.VITE_PAYSTACK_PUBLIC_KEY': JSON.stringify(env.VITE_PAYSTACK_PUBLIC_KEY)
    }
  }
})