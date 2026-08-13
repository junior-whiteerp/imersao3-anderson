import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

/** Nomes que só existem na noite de demonstração do Design OS. */
const MARCAS_DA_DEMO = [
  'Paulo Vidal',
  'Tiago Melo',
  'Dedé',
  'Nando',
  'João Ribeiro',
  'Marcos Lima',
  'Cris Andrade',
  '(11) 99002-7788',
  'roteiroInicial',
  'noiteVazia',
]

function arquivos(dir: string, acc: string[] = []): string[] {
  for (const nome of readdirSync(dir)) {
    const caminho = join(dir, nome)
    if (statSync(caminho).isDirectory()) arquivos(caminho, acc)
    else if (/\.(ts|tsx|json)$/.test(nome)) acc.push(caminho)
  }
  return acc
}

describe('nenhum dado de exemplo apresentado como real', () => {
  const fontes = arquivos('src')

  it('nenhum arquivo de src/ importa sample-data.json', () => {
    const culpados = fontes.filter((f) => readFileSync(f, 'utf8').includes('sample-data'))
    expect(culpados).toEqual([])
  })

  it('nenhum arquivo de src/ importa de product-plan/', () => {
    const culpados = fontes.filter((f) => readFileSync(f, 'utf8').includes('product-plan'))
    expect(culpados).toEqual([])
  })

  it('nenhum nome da noite de demonstração está embutido no código', () => {
    const culpados: string[] = []
    for (const f of fontes) {
      // Os dealers do seed são reais no banco, não no código.
      if (f.endsWith('banco/seed.sql')) continue
      const texto = readFileSync(f, 'utf8')
      for (const marca of MARCAS_DA_DEMO) {
        if (texto.includes(marca)) culpados.push(`${f} → ${marca}`)
      }
    }
    expect(culpados).toEqual([])
  })
})
