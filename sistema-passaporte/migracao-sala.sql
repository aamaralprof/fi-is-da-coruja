-- Aplicar uma vez no mesmo D1 do passaporte. Não altera os inventários.
CREATE TABLE IF NOT EXISTS salas (
 codigo TEXT PRIMARY KEY REFERENCES passaportes(codigo) ON DELETE CASCADE,
 estado TEXT NOT NULL,
 revisao INTEGER NOT NULL DEFAULT 1,
 atualizado_em TEXT NOT NULL
);
