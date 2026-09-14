-- Área do Professor — aplicar UMA vez no mesmo D1 do passaporte.
--
-- Não apaga nada e não mexe no percurso nem nas salas. As duas colunas
-- entram com valor padrão, então todo passaporte que já existe continua
-- sendo de aluno, sem turma, exatamente como estava.
--
-- O nome do aluno continua fora do banco. Só a turma entra, e turma é
-- rótulo de classe, não identificação de pessoa: "7º B" não diz quem é
-- ninguém. A ligação entre código e nome segue existindo em um lugar só,
-- a folha impressa que fica com a professora.
--
-- SQLite não aceita "ADD COLUMN IF NOT EXISTS". Rodar este arquivo duas
-- vezes acusa "duplicate column name" — é só sinal de que já foi aplicado.

ALTER TABLE passaportes ADD COLUMN papel TEXT NOT NULL DEFAULT 'aluno';
ALTER TABLE passaportes ADD COLUMN turma TEXT;

CREATE INDEX IF NOT EXISTS passaportes_por_turma ON passaportes(turma);

-- Depois de aplicar, promova o seu próprio passaporte a professora.
-- Troque o código pelo que estiver na sua etiqueta e execute:
--
--     UPDATE passaportes SET papel = 'professor' WHERE codigo = 'CORUJA-XXXX';
--
-- Para conferir quem é professor:
--
--     SELECT codigo, papel, turma FROM passaportes WHERE papel = 'professor';
