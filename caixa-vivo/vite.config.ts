import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  server: {
    port: 3400,
    strictPort: false,
    // Em desenvolvimento o Vite serve a tela e encaminha a API para o servidor
    // na 3402. É o que permite o navegador usar caminho relativo `/api/...` nos
    // dois mundos: aqui o proxy resolve, em produção o mesmo processo serve os
    // dois. Sem isso o cookie de sessão não viajaria — origem diferente.
    proxy: {
      '/api': { target: 'http://127.0.0.1:3402', changeOrigin: false },
    },
  },
  // `vite preview` serve só o bundle, sem API. Vale para conferir o visual;
  // para rodar o app de verdade use `npm start`, que sobe o servidor.
  preview: { port: 3401, strictPort: false, allowedHosts: true },
})
