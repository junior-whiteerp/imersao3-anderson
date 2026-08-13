/**
 * A noite ate agora, escrita como acoes.
 *
 * Nada aqui e um numero pronto: o estado inicial e o resultado de rodar estas
 * acoes pelo mesmo reducer que as telas usam. Isso torna impossivel a simulacao
 * comecar de um estado que o proprio app nao conseguiria produzir.
 *
 * Cada passo tambem carrega a narracao do modo apresentacao. Os dois usos vivem
 * no mesmo lugar de proposito: se a demo contasse a noite a partir de um roteiro
 * separado, ela poderia contar uma noite que o app nao produz.
 */

import { paraMinutos, type Noite } from './modelo'
import type { Acao } from './reducer'

export const CLUBE = 'Clube Paris'

/** Jogadores e dealers existem entre sessoes. A noite comeca com eles ja no sistema. */
export const noiteVazia: Noite = {
  agora: paraMinutos('19h00'),
  sessao: null,
  jogadores: [
    { id: 'j-paulo', nome: 'Paulo Vidal', whatsapp: '(11) 99002-7788', limite: 6000 },
    { id: 'j-rafa', nome: 'Rafa', whatsapp: '(11) 98812-4470', limite: 3000 },
    {
      id: 'j-tiago',
      nome: 'Tiago Melo',
      whatsapp: '(11) 99640-2213',
      cpf: '412.908.336-70',
      limite: 2000,
    },
    { id: 'j-dede', nome: 'Dedé', whatsapp: '(21) 98330-5561', limite: 5000 },
    { id: 'j-bia', nome: 'Bia', whatsapp: '(11) 97701-8834', limite: 1500 },
    { id: 'j-nando', nome: 'Nando', whatsapp: '(11) 98155-3092', limite: 3000 },
  ],
  sessoes: [],
  participacoes: [],
  dealers: [
    { id: 'd-joao', nome: 'João Ribeiro' },
    { id: 'd-marcos', nome: 'Marcos Lima' },
    { id: 'd-cris', nome: 'Cris Andrade' },
  ],
  turnos: [],
  movimentacoes: [],
  checkpoints: [],
  furoOculto: 0,
  aviso: null,
  seq: 1,
}

export interface Passo {
  emAs: string
  acoes: Acao[]
  /** Título do capítulo, no modo apresentação. */
  titulo: string
  /** O que está acontecendo e por que importa. Duas frases, no máximo. */
  narracao: string
  /** Para onde a apresentação leva o olho depois de aplicar as ações. */
  rota: string
}

/** O que a apresentação mostra antes de a noite começar. */
export const ABERTURA = {
  titulo: 'Antes de tudo',
  narracao:
    'Nenhuma sessão aberta. O caixa de fichas ainda não foi contado, e é desse número que a conferência da noite inteira parte.',
  rota: '/sessao',
} as const

/**
 * O roteiro de 19h00 ate 21h47 — o estado em que a simulacao abre.
 *
 * Duas fichas somem no meio do caminho, sem registro: R$ 60 antes das 20h15 e
 * R$ 480 entre 20h15 e 21h08. O app so descobre isso quando o operador conta a
 * caixa no lancamento de rake — que e exatamente a promessa do produto.
 */
export const roteiro: Passo[] = [
  {
    emAs: '19h00',
    titulo: 'A noite abre',
    narracao:
      'O operador conta o caixa de fichas e informa R$ 20.000. João assume o primeiro turno.',
    rota: '/sessao',
    acoes: [
      { tipo: 'abrir-sessao', clube: CLUBE, caixaInicial: 20000 },
      { tipo: 'abrir-turno', dealerId: 'd-joao' },
    ],
  },
  {
    emAs: '19h05',
    titulo: 'Paulo chega',
    narracao:
      'O operador digita o valor e gira a tela. O jogador confirma antes de a ficha sair — é isso que acaba com a contestação depois.',
    rota: '/fichas',
    acoes: [
      { tipo: 'sentar', jogadorId: 'j-paulo', lugar: 3 },
      { tipo: 'lancar-retirada', participacaoId: 'AUTO:j-paulo', valor: 2000 },
      { tipo: 'confirmar', movimentacaoId: 'ULTIMA', confirmacao: 'presencial' },
    ],
  },
  {
    emAs: '19h10',
    titulo: 'Rafa senta',
    narracao:
      'R$ 1.000 confirmados. O saldo de cada jogador fica atualizado sozinho — ninguém soma nada à mão.',
    rota: '/mesa',
    acoes: [
      { tipo: 'sentar', jogadorId: 'j-rafa', lugar: 1 },
      { tipo: 'lancar-retirada', participacaoId: 'AUTO:j-rafa', valor: 1000 },
      { tipo: 'confirmar', movimentacaoId: 'ULTIMA', confirmacao: 'presencial' },
    ],
  },
  {
    emAs: '19h25',
    titulo: 'Tiago senta',
    narracao:
      'Três na mesa, R$ 3.800 fora da caixa. Esse número não é furo: são fichas que saíram e ainda não voltaram.',
    rota: '/ao-vivo',
    acoes: [
      { tipo: 'sentar', jogadorId: 'j-tiago', lugar: 6 },
      { tipo: 'lancar-retirada', participacaoId: 'AUTO:j-tiago', valor: 800 },
      { tipo: 'confirmar', movimentacaoId: 'ULTIMA', confirmacao: 'presencial' },
    ],
  },
  {
    emAs: '19h37',
    titulo: 'Primeiro rake · primeiro checkpoint',
    narracao:
      'O dealer entrega o rake que saiu da mesa às 19h35. Ao lançar, o app conta a caixa e congela um veredito: fecha.',
    rota: '/caixa',
    acoes: [{ tipo: 'lancar-rake', valor: 180, horaOcorrencia: paraMinutos('19h35') }],
  },
  {
    emAs: '19h40',
    titulo: 'Dedé senta',
    narracao: 'Quarto jogador na mesa. A noite entra no ritmo.',
    rota: '/mesa',
    acoes: [
      { tipo: 'sentar', jogadorId: 'j-dede', lugar: 4 },
      { tipo: 'lancar-retirada', participacaoId: 'AUTO:j-dede', valor: 1500 },
      { tipo: 'confirmar', movimentacaoId: 'ULTIMA', confirmacao: 'presencial' },
    ],
  },
  {
    emAs: '19h52',
    titulo: 'Somem R$ 60',
    narracao:
      'Aqui a simulação faz o que a noite real faz sem avisar: R$ 60 saem da caixa sem registro nenhum. O app ainda não sabe.',
    rota: '/ao-vivo',
    acoes: [
      { tipo: 'lancar-retirada', participacaoId: 'AUTO:j-paulo', valor: 1500 },
      { tipo: 'confirmar', movimentacaoId: 'ULTIMA', confirmacao: 'presencial' },
      // Some uma ficha de R$ 60 sem registro nenhum.
      { tipo: 'injetar-furo', valor: 60 },
    ],
  },
  {
    emAs: '20h10',
    titulo: 'Troca de dealer',
    narracao:
      'Marcos assume. O turno de João fecha no mesmo instante — dois turnos nunca se sobrepõem.',
    rota: '/rake',
    acoes: [{ tipo: 'trocar-dealer', dealerId: 'd-marcos' }],
  },
  {
    emAs: '20h15',
    titulo: 'O app acha os R$ 60',
    narracao:
      'Segundo rake, segundo checkpoint: faltam R$ 60, entre 19h35 e 20h15. Até R$ 100 o app registra e a sessão segue.',
    rota: '/caixa',
    acoes: [
      { tipo: 'lancar-rake', valor: 220, horaOcorrencia: paraMinutos('20h15') },
      { tipo: 'sentar', jogadorId: 'j-bia', lugar: 8 },
      { tipo: 'lancar-retirada', participacaoId: 'AUTO:j-bia', valor: 1400 },
      { tipo: 'confirmar', movimentacaoId: 'ULTIMA', confirmacao: 'presencial' },
    ],
  },
  {
    emAs: '20h31',
    titulo: 'Contingência · e o furo grande',
    narracao:
      'Paulo atendeu o telefone e não olhou a tela. O operador confirma por ele, com motivo escrito e no teto de 3 por sessão. E R$ 480 somem sem registro.',
    rota: '/fichas',
    acoes: [
      { tipo: 'lancar-retirada', participacaoId: 'AUTO:j-paulo', valor: 1520 },
      {
        tipo: 'confirmar',
        movimentacaoId: 'ULTIMA',
        confirmacao: 'contingencia',
        motivo: 'Jogador atendeu o telefone e virou de costas.',
      },
      // O furo grande: R$ 480 dentro da janela das 20h15 as 21h08.
      { tipo: 'injetar-furo', valor: 480 },
    ],
  },
  {
    emAs: '20h50',
    titulo: 'Paulo fecha a conta',
    narracao:
      'Devolução é sempre fechamento de conta. O extrato aparece linha a linha, com a contingência marcada — não só o total.',
    rota: '/fichas',
    acoes: [
      { tipo: 'devolver-e-encerrar', participacaoId: 'AUTO:j-paulo', valor: 5960 },
    ],
  },
  {
    emAs: '21h05',
    titulo: 'João volta',
    narracao: 'Guarde esta hora: 21h05. Ela vai importar no próximo lançamento de rake.',
    rota: '/rake',
    acoes: [{ tipo: 'trocar-dealer', dealerId: 'd-joao' }],
  },
  {
    emAs: '21h10',
    titulo: 'Nando senta',
    narracao: 'Mais um na mesa, já no turno de João.',
    rota: '/mesa',
    acoes: [
      { tipo: 'sentar', jogadorId: 'j-nando', lugar: 10 },
      { tipo: 'lancar-retirada', participacaoId: 'AUTO:j-nando', valor: 1200 },
      { tipo: 'confirmar', movimentacaoId: 'ULTIMA', confirmacao: 'presencial' },
    ],
  },
  {
    // Saiu da mesa as 21h08, digitado as 21h12. A troca de dealer foi as 21h05,
    // entao o rake pertence ao turno 3 — e a hora de ocorrencia que decide.
    emAs: '21h12',
    titulo: 'Rake retroativo · e os R$ 480 aparecem',
    narracao:
      'O rake saiu da mesa às 21h08 e foi digitado às 21h12. O app usa a hora em que saiu, não a de digitação — senão a janela cairia no dealer errado. Terceiro checkpoint: faltam R$ 480.',
    rota: '/caixa',
    acoes: [{ tipo: 'lancar-rake', valor: 260, horaOcorrencia: paraMinutos('21h08') }],
  },
  {
    emAs: '21h20',
    titulo: 'Dedé pede mais',
    narracao: 'Mais R$ 1.000, dentro do limite dele. Confirmado na tela.',
    rota: '/fichas',
    acoes: [
      { tipo: 'lancar-retirada', participacaoId: 'AUTO:j-dede', valor: 1000 },
      { tipo: 'confirmar', movimentacaoId: 'ULTIMA', confirmacao: 'presencial' },
    ],
  },
  {
    emAs: '21h41',
    titulo: 'Quarto checkpoint · caixa fechado',
    narracao:
      'Nada sumiu desde a conferência anterior. A conta bate, e o veredito volta a ser verde.',
    rota: '/caixa',
    acoes: [{ tipo: 'lancar-rake', valor: 300, horaOcorrencia: paraMinutos('21h40') }],
  },
  {
    emAs: '21h44',
    titulo: 'Ficha depois do checkpoint',
    narracao:
      'O veredito das 21h40 continua congelado, mas a faixa volta ao neutro: fichas se moveram depois dele, e o app não finge saber de uma conta que ninguém contou.',
    rota: '/painel',
    acoes: [
      // Ficha confirmada depois do checkpoint: quebra o congelamento e devolve
      // a faixa ao estado neutro, que e como a noite passa a maior parte do tempo.
      { tipo: 'lancar-retirada', participacaoId: 'AUTO:j-rafa', valor: 480 },
      { tipo: 'confirmar', movimentacaoId: 'ULTIMA', confirmacao: 'presencial' },
    ],
  },
  {
    emAs: '21h45',
    titulo: 'Retirada aguardando confirmação',
    narracao:
      'Dedé pediu R$ 300 e ainda não confirmou. O limite dele já conta esse valor — a regra nasceu de duas retiradas pendentes que, somadas, estouravam o limite.',
    rota: '/mesa',
    acoes: [
      // Fica aguardando de proposito: e o caso que faz as regras N6 e N18
      // existirem, e o unico jeito de ver o limite contar o que ainda nao saiu.
      { tipo: 'lancar-retirada', participacaoId: 'AUTO:j-dede', valor: 300 },
    ],
  },
  {
    emAs: '21h47',
    titulo: 'A noite, de ponta a ponta',
    narracao:
      'Duas divergências achadas, cada uma na janela de meia hora em que aconteceu, com o dealer do turno. Antes, isso era um único número no fim de dez horas.',
    rota: '/painel',
    acoes: [],
  },
]

/**
 * O fim da noite.
 *
 * Nao entra no estado inicial da simulacao — a simulacao abre as 21h47, com a
 * mesa cheia. Estes passos existem para a apresentacao poder terminar a
 * historia: as contas fecham, o rake final entra, a sessao encerra e o
 * relatorio fica guardado.
 */
export const epilogo: Passo[] = [
  {
    emAs: '21h50',
    titulo: 'Rafa sai',
    narracao:
      'Conta as fichas junto com ele, lança a devolução, mostra o extrato linha a linha, encerra a conta.',
    rota: '/fichas',
    acoes: [
      { tipo: 'devolver-e-encerrar', participacaoId: 'AUTO:j-rafa', valor: 1480 },
    ],
  },
  {
    emAs: '21h54',
    titulo: 'Tiago sai',
    narracao: 'Devolveu exatamente o que tirou. A noite dele fecha em zero.',
    rota: '/fichas',
    acoes: [
      { tipo: 'devolver-e-encerrar', participacaoId: 'AUTO:j-tiago', valor: 800 },
    ],
  },
  {
    emAs: '21h58',
    titulo: 'Dedé sai · o pendente é cancelado',
    narracao:
      'Ele tinha R$ 300 esperando confirmação. Ao encerrar a conta, o lançamento é cancelado — a ficha nunca saiu, e o registro guarda isso.',
    rota: '/fichas',
    acoes: [
      { tipo: 'devolver-e-encerrar', participacaoId: 'AUTO:j-dede', valor: 2500 },
    ],
  },
  {
    emAs: '22h02',
    titulo: 'Bia sai',
    narracao: 'Quarta conta fechada. Restam dois na mesa.',
    rota: '/mesa',
    acoes: [{ tipo: 'devolver-e-encerrar', participacaoId: 'AUTO:j-bia', valor: 1400 }],
  },
  {
    emAs: '22h06',
    titulo: 'Nando sai · mesa vazia',
    narracao:
      'A sessão não encerra com jogador na mesa. Agora ela pode — e não por acaso: o botão ficou desligado até aqui.',
    rota: '/mesa',
    acoes: [
      { tipo: 'devolver-e-encerrar', participacaoId: 'AUTO:j-nando', valor: 1200 },
    ],
  },
  {
    emAs: '22h10',
    titulo: 'Rake final',
    narracao:
      'O último rake da noite entra e abre a quinta conferência. Ela fecha: nada sumiu depois das 21h40.',
    rota: '/caixa',
    acoes: [{ tipo: 'lancar-rake', valor: 240, horaOcorrencia: paraMinutos('22h08') }],
  },
  {
    emAs: '22h15',
    titulo: 'A noite encerra · o relatório fica',
    narracao:
      'A conferência final é gravada e o relatório fica guardado: os R$ 540 que faltaram na noite, cada um na sua janela, com o dealer do turno e a exceção com motivo escrito. Isto é o que substitui o papel.',
    rota: '/caixa',
    acoes: [{ tipo: 'encerrar-sessao' }],
  },
]

/** A noite inteira, do caixa vazio ao relatório. É o que a apresentação toca. */
export const roteiroCompleto: Passo[] = [...roteiro, ...epilogo]
