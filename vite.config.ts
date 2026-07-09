import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/recruiter-notes-/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
