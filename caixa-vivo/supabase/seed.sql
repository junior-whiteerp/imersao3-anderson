insert into clube (id, nome, percentual_rake_dealer) values
  ('11111111-1111-1111-1111-111111111111', 'Clube Paris', 0);

insert into dealer (id, clube_id, nome) values
  ('22222222-2222-2222-2222-222222222221', '11111111-1111-1111-1111-111111111111', 'João Ribeiro'),
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Marcos Lima'),
  ('22222222-2222-2222-2222-222222222223', '11111111-1111-1111-1111-111111111111', 'Cris Andrade');

-- ─────────────────────────────────────────────────────────────────────────
-- O operador de DESENVOLVIMENTO.
--
-- ⚠️ Este bloco só roda em `supabase db reset`, que é comando de banco local
-- em Docker. Ele NÃO viaja num `supabase db push` para produção. A conta do
-- operador de verdade é criada à mão no painel (Authentication → Users), com
-- senha que ninguém leu num arquivo — como diz a Task 7 do plano.
--
-- Ele existe aqui por um motivo só: sem conta, ninguém abre o app para
-- conferir a noite com os olhos, e a tela de login vira um muro no
-- desenvolvimento.
--
--   operador@clubeparis.local  /  caixavivo
-- ─────────────────────────────────────────────────────────────────────────
-- Os campos de token vão como string vazia, e não nulos, de propósito: o GoTrue
-- lê essas colunas em `string` do Go, e um NULL ali derruba o login inteiro com
-- "Database error querying schema" — erro que não fala nada sobre a causa.
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data,
  confirmation_token, recovery_token, email_change_token_new, email_change,
  email_change_token_current, phone_change, phone_change_token, reauthentication_token
) values (
  '00000000-0000-0000-0000-000000000000',
  '33333333-3333-3333-3333-333333333333',
  'authenticated', 'authenticated', 'operador@clubeparis.local',
  crypt('caixavivo', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb,
  '', '', '', '', '', '', '', ''
);

insert into auth.identities (
  provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
) values (
  '33333333-3333-3333-3333-333333333333',
  '33333333-3333-3333-3333-333333333333',
  '{"sub":"33333333-3333-3333-3333-333333333333","email":"operador@clubeparis.local","email_verified":true,"phone_verified":false}'::jsonb,
  'email', now(), now(), now()
);

insert into operador (id, clube_id, nome) values
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Anderson');
