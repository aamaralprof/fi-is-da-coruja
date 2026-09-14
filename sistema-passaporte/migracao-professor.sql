ALTER TABLE passaportes ADD COLUMN papel TEXT NOT NULL DEFAULT 'aluno';
ALTER TABLE passaportes ADD COLUMN turma TEXT;
CREATE INDEX IF NOT EXISTS passaportes_por_turma ON passaportes(turma);
