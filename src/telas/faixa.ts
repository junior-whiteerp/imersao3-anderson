import type { CaixaStatus } from '@/shell/components'
import {
  checkpointsDaSessao,
  dealerDo,
  estadoDaFaixa,
  fichasEmJogo,
  formatarHora,
  participacoesAbertas,
  reais,
  turnoAberto,
  type Noite,
} from '@/regras/modelo'

/**
 * A leitura da faixa do topo.
 *
 * No estado neutro ela mostra as **fichas em jogo** — quanto saiu e ainda não
 * voltou. Esse é o número que o app realmente conhece entre dois checkpoints;
 * a diferença da caixa só existe depois de alguém contar a caixa (N8, N9).
 */
export function statusDaFaixa(noite: Noite): CaixaStatus {
  const estado = estadoDaFaixa(noite)
  const turno = turnoAberto(noite)
  const checkpoints = checkpointsDaSessao(noite)
  const ultimo = checkpoints[checkpoints.length - 1]

  if (estado === 'sem-sessao') return { estado, valor: 'Abrir a noite' }

  const base = {
    hora: formatarHora(noite.agora),
    turno: turno?.numero,
    dealer: dealerDo(noite, turno).split(' ')[0],
    jogadores: participacoesAbertas(noite).length,
  }

  if (estado === 'neutro') {
    return {
      ...base,
      estado,
      rotulo: 'Fichas em jogo',
      valor: reais(fichasEmJogo(noite)),
      mensagem: ultimo
        ? `Rake não declarado desde ${formatarHora(ultimo.hora)}`
        : 'Nenhum rake lançado ainda',
    }
  }

  const janela = `${formatarHora(ultimo.janelaInicio)}–${formatarHora(ultimo.janelaFim)}`

  if (estado === 'fechado') {
    return {
      ...base,
      estado,
      hora: formatarHora(ultimo.hora),
      valor: 'Caixa fechado',
      mensagem: `Checkpoint ${ultimo.numero} · ${janela}`,
    }
  }

  return {
    ...base,
    estado,
    hora: formatarHora(ultimo.hora),
    valor: `Faltam ${reais(ultimo.diferenca)}`,
    mensagem:
      estado === 'furo'
        ? `${janela} · suspender novas retiradas?`
        : `${janela} · revisar a janela agora`,
  }
}
