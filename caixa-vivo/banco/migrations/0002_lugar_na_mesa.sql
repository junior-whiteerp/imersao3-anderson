-- O lugar na mesa ao vivo (F13, item 4 da divergencia D4 do PRD).
--
-- Ate aqui o numero do lugar nao existia como dado: era a posicao num array
-- ordenado por hora da primeira confirmacao. Quem fechava a conta fazia todo
-- mundo andar uma cadeira, e o lugar que o operador tocava era descartado.

alter table participacao
  add column lugar integer check (lugar between 1 and 10);

-- Um jogador por lugar, entre as contas ABERTAS.
--
-- Parcial de proposito: a conta encerrada guarda o lugar que teve (N13, nada e
-- apagado) e mesmo assim devolve a cadeira ao pool. O reducer ja valida isto;
-- o indice existe porque o reducer roda no navegador, e duas abas na mesma
-- noite podem sentar duas pessoas no lugar 7 por corrida.
create unique index participacao_um_por_lugar
  on participacao (sessao_id, lugar)
  where lugar is not null and not encerrada;
