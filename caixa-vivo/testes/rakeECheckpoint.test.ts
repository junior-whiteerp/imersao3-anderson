import { describe, it, expect, beforeEach } from 'vitest'
import { clienteDeTeste, limparBanco, CLUBE_TESTE, DEALER_JOAO, DEALER_MARCOS } from './banco'
import { aplicar } from '@/dados/aplicar'
import { carregarNoite } from '@/dados/carregarNoite'
import { reducer } from '@/regras/reducer'
import { checkpointsDaSessao } from '@/regras/modelo'

const db = clienteDeTeste()
const abrir = () =>
  aplicar(db, CLUBE_TESTE, null, {
    tipo: 'abrir-sessao',
    clube: 'Clube Paris',
    caixaInicial: 20000,
  })

describe('rake e checkpoint', () => {
  beforeEach(limparBanco)

  it('o lançamento de rake grava um checkpoint com veredito', async () => {
    await abrir()
    await aplicar(db, CLUBE_TESTE, null, { tipo: 'abrir-turno', dealerId: DEALER_JOAO })
    const noite = await carregarNoite(db, CLUBE_TESTE)

    const depois = await aplicar(db, CLUBE_TESTE, null, {
      tipo: 'lancar-rake',
      valor: 180,
      horaOcorrencia: noite.agora,
    })

    expect(depois.checkpoints).toHaveLength(1)
    expect(depois.checkpoints[0].veredito).toBe('fechado')
    expect(depois.checkpoints[0].diferenca).toBe(0)
  })

  /**
   * A5/N3 — o rake pertence ao turno da hora em que SAIU, não ao da digitação.
   *
   * O plano escrevia esta prova com `avancar-tempo`, e ela não podia passar:
   * `avancar-tempo` só mexe em `noite.agora` na memória, e `aplicar` recarrega
   * a noite do banco, onde a hora vem do relógio de verdade. As duas trocas de
   * turno caíam no mesmo minuto, o turno do João fechava com `fim === inicio`,
   * e `turnoEm` (que exige `hora < fim`) não encontrava turno nenhum ali.
   *
   * A noite é montada direto no banco — uma sessão aberta há uma hora, com dois
   * turnos de fronteiras explícitas. É mais fiel ao que o produto vê às 21h do
   * que qualquer avanço de relógio simulado, e o lançamento do rake continua
   * passando pelo caminho de escrita real.
   */
  it('A5 — o rake vai para o turno da hora em que SAIU, não da digitação', async () => {
    const abertaEm = new Date(Date.now() - 60 * 60 * 1000)
    const { data: s } = await db
      .from('sessao')
      .insert({
        clube_id: CLUBE_TESTE,
        aberta_em: abertaEm.toISOString(),
        caixa_inicial: 20000,
        aberta: true,
      })
      .select()
      .single()

    const noite = await carregarNoite(db, CLUBE_TESTE)
    const agora = noite.agora
    const inicioDaNoite = noite.sessao!.abertaEm

    // João das 20h às 20h40; Marcos das 20h40 até agora.
    await db.from('turno').insert([
      {
        sessao_id: s!.id,
        dealer_id: DEALER_JOAO,
        numero: 1,
        inicio: inicioDaNoite,
        fim: agora - 20,
      },
      { sessao_id: s!.id, dealer_id: DEALER_MARCOS, numero: 2, inicio: agora - 20, fim: null },
    ])

    // O rake saiu da mesa 40 minutos atrás — dentro do turno do João —, mas só
    // agora está sendo digitado, já com o Marcos na mesa.
    const horaDeSaida = agora - 40
    const depois = await aplicar(db, CLUBE_TESTE, null, {
      tipo: 'lancar-rake',
      valor: 180,
      horaOcorrencia: horaDeSaida,
    })

    // `aviso` também carrega o sucesso ("Caixa fechado."), então quem prova que
    // o lançamento passou é a movimentação existir.
    expect(depois.movimentacoes.filter((m) => m.tipo === 'rake')).toHaveLength(1)
    const rake = depois.movimentacoes.find((m) => m.tipo === 'rake')!
    const turnoDoRake = depois.turnos.find((t) => t.id === rake.turnoId)!
    expect(turnoDoRake.numero).toBe(1)
    expect(turnoDoRake.dealerId).toBe(DEALER_JOAO)
  })

  /**
   * O furo é ferramenta de simulação, não de produto.
   *
   * `injetar-furo` só mexe em `furoOculto`, que vive na memória e não tem coluna
   * no banco — `aplicar` recarrega e ele se perde. O plano já previa esta
   * ressalva e mandava provar a regra chamando o `reducer` direto. É o que este
   * teste faz, partindo de uma noite carregada do Postgres de verdade.
   *
   * A consequência para o produto está registrada no fim do plano: enquanto o
   * operador não DIGITAR o valor contado no lançamento de rake, o checkpoint
   * nunca acha furo de verdade. É o primeiro item do próximo plano.
   */
  it('o checkpoint acha a ficha que sumiu, na janela certa (via reducer)', async () => {
    await abrir()
    await aplicar(db, CLUBE_TESTE, null, { tipo: 'abrir-turno', dealerId: DEALER_JOAO })
    const doBanco = await carregarNoite(db, CLUBE_TESTE)

    // 480 saem da caixa sem registro nenhum
    let noite = reducer(doBanco, { tipo: 'injetar-furo', valor: 480 })
    noite = reducer(noite, { tipo: 'lancar-rake', valor: 180, horaOcorrencia: noite.agora })

    const cps = checkpointsDaSessao(noite)
    expect(cps).toHaveLength(1)
    expect(cps[0].diferenca).toBe(480)
    expect(cps[0].veredito).toBe('revisar')
  })

  it('furoOculto realmente não sobrevive ao ciclo com banco — a ressalva acima é real', async () => {
    await abrir()
    await aplicar(db, CLUBE_TESTE, null, { tipo: 'abrir-turno', dealerId: DEALER_JOAO })
    const depois = await aplicar(db, CLUBE_TESTE, null, { tipo: 'injetar-furo', valor: 480 })
    expect(depois.furoOculto).toBe(0)
  })
})
