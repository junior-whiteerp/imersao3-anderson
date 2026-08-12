import '@testing-library/jest-dom/vitest'

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
