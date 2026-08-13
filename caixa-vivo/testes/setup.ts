import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

/**
 * O auto-cleanup do Testing Library só se registra sozinho quando o Vitest roda
 * com `globals: true`. Aqui os testes importam `describe`/`it`/`expect` na mão,
 * então o cleanup também é na mão — sem ele o segundo `render` de um arquivo
 * acha dois botões "Abrir a noite" e o teste falha por sujeira, não por defeito.
 */
afterEach(cleanup)

/**
 * O jsdom não implementa `matchMedia`, e o `FundoDePoker` do Login pergunta por
 * `prefers-reduced-motion` antes de animar. Sem este remendo o teste quebraria
 * falando de `matchMedia` em vez de falar do login.
 *
 * Responde `false` — nos testes a cena de fundo fica parada, que é o que
 * interessa: ninguém está medindo animação aqui.
 */
if (!window.matchMedia) {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList
}
