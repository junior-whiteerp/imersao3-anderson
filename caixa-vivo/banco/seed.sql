-- Dados de partida: o clube e os dealers.
--
-- A CONTA DO OPERADOR NÃO ESTÁ AQUI, de propósito. Senha em arquivo versionado
-- é senha vazada. Ela é criada por `npm run banco:operador`, que gera o hash
-- scrypt na hora e nunca escreve a senha em lugar nenhum.
--
-- Rodar de novo não duplica nada.

insert into clube (id, nome, percentual_rake_dealer) values
  ('11111111-1111-1111-1111-111111111111', 'Clube Paris', 0)
on conflict (id) do nothing;

insert into dealer (id, clube_id, nome) values
  ('22222222-2222-2222-2222-222222222221', '11111111-1111-1111-1111-111111111111', 'João Ribeiro'),
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Marcos Lima'),
  ('22222222-2222-2222-2222-222222222223', '11111111-1111-1111-1111-111111111111', 'Cris Andrade')
on conflict (id) do nothing;
