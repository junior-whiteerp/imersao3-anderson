import type { Acao } from '@/regras/reducer'

/**
 * O que o navegador tem permissão de pedir.
 *
 * O `Acao` do reducer tem dezesseis variantes, e nem todas são ação de
 * operador. Quatro ficam de fora, e a razão de cada uma importa:
 *
 * - `reiniciar` e `injetar-furo` são ferramentas da simulação do Design OS.
 *   Expostas numa API pública, a primeira apaga a noite e a segunda inventa
 *   uma divergência de caixa que nunca aconteceu.
 * - `avancar-tempo` existe para a prévia adiantar o relógio. No produto quem
 *   diz a hora é o relógio do servidor, e nada além dele.
 * - `limpar-aviso` é estado de tela. Ela é tratada no navegador, porque custaria
 *   uma ida inteira ao Postgres — ler, reduzir, gravar, reler — só para tirar
 *   uma tarja da tela.
 *
 * TypeScript não confere nada em tempo de execução: sem esta lista, um `curl`
 * com `{"tipo":"reiniciar"}` seria obedecido.
 */
const PERMITIDAS = {
  'abrir-sessao': (a: Rec) => texto(a.clube) && inteiroPositivo(a.caixaInicial),
  'encerrar-sessao': (a: Rec) => a.caixaContado === undefined || inteiroPositivo(a.caixaContado),
  'cadastrar-jogador': (a: Rec) =>
    texto(a.nome) &&
    texto(a.whatsapp) &&
    (a.cpf === undefined || typeof a.cpf === 'string') &&
    inteiroPositivo(a.limite) &&
    typeof a.sentar === 'boolean' &&
    (a.confirmouOutraPessoa === undefined || typeof a.confirmouOutraPessoa === 'boolean'),
  sentar: (a: Rec) =>
    texto(a.jogadorId) &&
    (a.lugar === undefined || (inteiroPositivo(a.lugar) && (a.lugar as number) <= 10)),
  'lancar-retirada': (a: Rec) =>
    texto(a.participacaoId) && inteiroPositivo(a.valor) && opcionalTexto(a.motivo),
  confirmar: (a: Rec) =>
    texto(a.movimentacaoId) &&
    (a.confirmacao === 'presencial' || a.confirmacao === 'contingencia') &&
    opcionalTexto(a.motivo),
  recusar: (a: Rec) => texto(a.movimentacaoId),
  'devolver-e-encerrar': (a: Rec) => texto(a.participacaoId) && inteiroNaoNegativo(a.valor),
  'abrir-turno': (a: Rec) => texto(a.dealerId),
  'trocar-dealer': (a: Rec) => texto(a.dealerId),
  'lancar-rake': (a: Rec) => inteiroPositivo(a.valor) && inteiroNaoNegativo(a.horaOcorrencia),
} as const

type Rec = Record<string, unknown>

export type Validacao = { ok: true; acao: Acao } | { ok: false; motivo: string }

export function validarAcao(corpo: unknown): Validacao {
  if (typeof corpo !== 'object' || corpo === null || Array.isArray(corpo)) {
    return { ok: false, motivo: 'O corpo do pedido precisa ser um objeto.' }
  }

  const a = corpo as Rec
  const tipo = a.tipo

  if (typeof tipo !== 'string') {
    return { ok: false, motivo: 'Falta o campo `tipo`.' }
  }

  const confere = (PERMITIDAS as Record<string, ((a: Rec) => boolean) | undefined>)[tipo]
  if (!confere) {
    return { ok: false, motivo: `A ação "${tipo}" não existe ou não é permitida pela API.` }
  }

  if (!confere(a)) {
    return { ok: false, motivo: `Os campos da ação "${tipo}" estão incompletos ou inválidos.` }
  }

  return { ok: true, acao: corpo as Acao }
}

const texto = (v: unknown): boolean => typeof v === 'string' && v.trim() !== ''
const opcionalTexto = (v: unknown): boolean => v === undefined || typeof v === 'string'
const inteiroPositivo = (v: unknown): boolean => Number.isInteger(v) && (v as number) > 0
const inteiroNaoNegativo = (v: unknown): boolean => Number.isInteger(v) && (v as number) >= 0
