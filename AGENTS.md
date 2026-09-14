# Fíeis da Coruja — Regras de trabalho

1. Antes de implementar funcionalidades, consultar `docs/MAPA_DO_SITE.md`.

2. Localizar primeiro os arquivos diretamente relacionados à tarefa.

3. Evitar varreduras amplas do repositório quando o mapa técnico já indicar os arquivos relevantes.

4. Reutilizar componentes existentes antes de criar novos.

5. Não criar sistemas paralelos para funcionalidades que já possuem implementação.

6. Não criar segundo sistema de autenticação, passaporte, inventário, progresso ou persistência.

7. Não alterar schema do banco sem necessidade explícita da tarefa.

8. Não refatorar código não relacionado à solicitação atual.

9. Preservar compatibilidade mobile e os padrões visuais existentes.

10. Preservar dados e progresso já existentes dos alunos.

11. Quando uma tarefa modificar a arquitetura, adicionar/remover sistemas, tabelas, rotas ou componentes importantes, atualizar `docs/MAPA_DO_SITE.md` ao final.

12. Não preencher lacunas arquitetônicas por suposição. Inspecionar o código correspondente quando necessário.
