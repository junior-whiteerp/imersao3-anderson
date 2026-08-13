import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const MARCAS = ['Paulo Vidal', 'Tiago Melo', '(11) 99002-7788', 'roteiroInicial']
const achados = []

function varrer(dir) {
  for (const nome of readdirSync(dir)) {
    const caminho = join(dir, nome)
    if (statSync(caminho).isDirectory()) varrer(caminho)
    else if (/\.(js|css|html)$/.test(nome)) {
      const texto = readFileSync(caminho, 'utf8')
      for (const m of MARCAS) if (texto.includes(m)) achados.push(`${caminho} → ${m}`)
    }
  }
}

// Os dois artefatos. O servidor também é código que vai para produção, e a
// noite de demonstração vazaria por ele do mesmo jeito.
for (const pasta of ['dist', 'dist-servidor']) {
  try {
    varrer(pasta)
  } catch {
    console.error(`Pasta ${pasta} não existe — rode \`npm run build\` antes.`)
    process.exit(1)
  }
}

if (achados.length) {
  console.error('A noite de demonstração vazou para o build:')
  for (const a of achados) console.error('  ' + a)
  process.exit(1)
}
console.log('Build limpo: nenhum dado de exemplo apresentado como real.')
