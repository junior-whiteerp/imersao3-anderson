import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  server: { port: 3400, strictPort: false },
  // Deploy: a Railway serve o bundle pronto com `vite preview`, atras de um
  // dominio dela. Sem liberar o Host, o Vite recusa o pedido com 403.
  // Liberar geral e seguro aqui: o que se serve e bundle publico, e a chave
  // anon do Supabase e publica por desenho — quem guarda o acesso e o RLS.
  preview: { port: 3401, strictPort: false, allowedHosts: true },
})
