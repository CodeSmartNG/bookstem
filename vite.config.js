
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    base: '/', // ← CHANGE THIS from './' to '/'
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'esbuild'
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