import { useMemo, useReducer, type ReactNode } from 'react'
import {
  SimulacaoContexto,
  montarNoiteInicial,
  reducerComReinicio,
} from './contexto'

export function SimulacaoProvider({ children }: { children: ReactNode }) {
  const [noite, despachar] = useReducer(
    reducerComReinicio,
    undefined,
    montarNoiteInicial
  )
  const valor = useMemo(() => ({ noite, despachar }), [noite])
  return <SimulacaoContexto.Provider value={valor}>{children}</SimulacaoContexto.Provider>
}
