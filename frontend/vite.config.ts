import { defineConfig } from 'vite'
import path from 'path'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000', // 백엔드 포트를 4000으로 수정
        changeOrigin: true,
        // rewrite 제거 또는 다음과 같이 수정
        // rewrite: (path) => path
      },
    },
  },
})
