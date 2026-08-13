import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Portas do projeto: faixa 3300-3999.
  // strictPort desligado — se a porta estiver ocupada, o Vite sobe para a proxima
  // dentro da faixa (3301, 3302, ...).
  server: {
    port: 3300,
    strictPort: false,
  },
  // Em producao (Railway) a porta vem por --port $PORT na linha de comando,
  // que vence esta. allowedHosts libera o dominio da Railway — sem isso o
  // Vite recusa o Host desconhecido com 403. E seguro: so se serve bundle.
  preview: {
    port: 3301,
    strictPort: false,
    allowedHosts: true,
  },
})
