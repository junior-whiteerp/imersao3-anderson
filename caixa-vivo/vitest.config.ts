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
    env: {
      /**
       * O mesmo banco para o pool dos testes e para o do servidor.
       *
       * `servidor/banco.ts` lê esta variável no import e explode sem ela — de
       * propósito. Quem chama `aplicar` num teste está exercitando o caminho
       * de verdade, RLS incluído.
       */
      DATABASE_URL:
        process.env.DATABASE_URL_TESTE ??
        process.env.DATABASE_URL ??
        'postgres://caixa:caixa@localhost:3432/caixa_vivo',
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
