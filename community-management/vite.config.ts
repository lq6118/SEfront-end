import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api': {
        target: 'http://172.18.198.240:8080',
        changeOrigin: true,
        secure: false,
        timeout: 15000,
      }
    }
  }
})
