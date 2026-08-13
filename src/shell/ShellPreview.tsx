import AppSimulado from '@/simulacao/AppSimulado'

/**
 * A previa do shell e o app inteiro rodando.
 *
 * As cinco secoes compartilham um estado so: lancar ficha muda o caixa, lancar
 * rake cria checkpoint, e a faixa do topo reage a tudo. As telas isoladas de
 * cada secao continuam existindo em `/sections/*` como desenho de referencia.
 */
export default function ShellPreview() {
  return <AppSimulado />
}
