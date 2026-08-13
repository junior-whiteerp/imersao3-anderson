import { describe, it, expect } from 'vitest'
import { agoraEmMinutos } from '../servidor/dados/relogio'

describe('agoraEmMinutos', () => {
  it('conta a partir da meia-noite do dia em que a sessão abriu', () => {
    const abriu = new Date('2026-08-12T19:00:00-03:00')
    const agora = new Date('2026-08-12T21:47:00-03:00')
    expect(agoraEmMinutos(abriu, agora)).toBe(21 * 60 + 47)
  })

  it('passa de 1440 quando a noite atravessa a meia-noite', () => {
    const abriu = new Date('2026-08-12T19:00:00-03:00')
    const agora = new Date('2026-08-13T02:30:00-03:00')
    // 26h30 desde a meia-noite do dia 12
    expect(agoraEmMinutos(abriu, agora)).toBe(26 * 60 + 30)
  })

  it('devolve a própria hora de abertura quando agora é a abertura', () => {
    const abriu = new Date('2026-08-12T19:00:00-03:00')
    expect(agoraEmMinutos(abriu, abriu)).toBe(19 * 60)
  })
})
