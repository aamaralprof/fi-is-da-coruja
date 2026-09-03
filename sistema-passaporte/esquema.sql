-- Banco do Passaporte — Fiéis da Coruja
--
-- Guarda o mínimo possível. Não há nome, e-mail, telefone, turma, escola,
-- idade ou qualquer outro dado que identifique um aluno. O banco sabe que
-- CORUJA-7K4M leu o capítulo 4; não sabe, e não tem como saber, quem é.
--
-- A ligação entre código e aluno existe num único lugar: a lista impressa
-- que fica com a professora. Perdida essa lista, os dados aqui deixam de
-- se referir a alguém.

CREATE TABLE IF NOT EXISTS passaportes (
  codigo        TEXT PRIMARY KEY,           -- CORUJA-7K4M
  pin_hash      TEXT NOT NULL,              -- PBKDF2-SHA256, nunca o PIN em si
  pin_sal       TEXT NOT NULL,
  criado_em     TEXT NOT NULL,
  ultimo_acesso TEXT,
  falhas        INTEGER NOT NULL DEFAULT 0, -- tentativas erradas seguidas
  bloqueado_ate TEXT                        -- trava temporária contra força bruta
);

CREATE TABLE IF NOT EXISTS percurso (
  codigo        TEXT NOT NULL,
  chave         TEXT NOT NULL,              -- sempre começa com "sofia-"
  valor         TEXT NOT NULL,
  registrado_em TEXT NOT NULL,
  PRIMARY KEY (codigo, chave),
  FOREIGN KEY (codigo) REFERENCES passaportes(codigo) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS percurso_por_codigo ON percurso(codigo);
