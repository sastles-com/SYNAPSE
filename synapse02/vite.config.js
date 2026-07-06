import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// synapse02 は synapse01（5173）と同時起動できるよう 5174 を使う。
// base はデプロイ互換のため synapse01 と同じ相対パス。
export default defineConfig({
  base: './',
  plugins: [react()],
  server: { port: 5174 },
})
