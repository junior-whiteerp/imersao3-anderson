import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  test: {
    environment: 'jsdom',
    setupFiles: ['./testes/setup.ts'],
    include: ['testes/**/*.test.ts', 'testes/**/*.test.tsx'],
    /**
     * Um Postgres só para todos os arquivos de teste.
     *
     * Por padrão o Vitest roda arquivos em paralelo, e aí o `limparBanco` de um
     * apaga a sessão que o outro acabou de abrir — a falha sai como violação de
     * chave estrangeira ou de `sessao_uma_aberta_por_clube`, que parece defeito
     * do produto e não é. A suíte inteira roda em menos de um segundo; não vale
     * trocar essa clareza por paralelismo.
     */
    fileParallelism: false,
    /**
     * `src/dados/supabase.ts` explode no import quando falta credencial — de
     * propósito (Task 3). Sem estas duas aqui, todo teste que encoste em
     * `NoiteProvider` ou `useOperador` quebraria antes da primeira asserção,
     * e o erro falaria de credencial em vez de falar do que o teste testa.
     *
     * O cliente criado com elas nunca sai para a rede nos testes: quem fala
     * com o Postgres é o `clienteDeTeste()` de `testes/banco.ts`.
     */
    env: {
      VITE_SUPABASE_URL: 'http://127.0.0.1:54321',
      VITE_SUPABASE_ANON_KEY: 'chave-anonima-de-teste',
      /**
       * `agoraEmMinutos` conta a partir da meia-noite LOCAL — é o fuso do clube
       * que define quando a noite começou, não o UTC. Sem fixar o fuso aqui, os
       * testes do relógio passariam nesta máquina e quebrariam num CI em UTC,
       * que é o pior jeito de descobrir isso.
       */
      TZ: 'America/Sao_Paulo',
    },
  },
})
