@echo off
chcp 65001 >nul
cd /d "%~dp0.."

echo.
echo   ============================================
echo     SEU PASSAPORTE DE PROFESSORA
echo   ============================================
echo.
echo   Cria UM passaporte, so seu, com permissao para
echo   ver a Sala de Investigacao de todos os alunos.
echo.
echo   A leva da turma nao e tocada: nenhum codigo de
echo   aluno muda, nenhum PIN muda, nada do progresso
echo   deles e mexido.
echo.
echo   Antes disso funcionar, a migracao precisa ter
echo   sido aplicada no banco ^(migracao-professor.sql^).
echo.
pause

echo.
python "sistema-passaporte\gerar_passaportes.py" --professor

if errorlevel 1 (
  echo.
  echo   Algo deu errado. Copie a mensagem acima e mostre ao Claude.
  echo.
  pause
  exit /b 1
)

echo   Abrindo a pasta com o arquivo...
start "" "%~dp0saida"

echo.
echo   ============================================
echo     O QUE FAZER AGORA
echo   ============================================
echo.
echo   1. ANOTE O CODIGO E O PIN que apareceram acima.
echo      O banco guarda o PIN cifrado, nao o PIN.
echo      Perdido, so gerando outro.
echo.
echo   2. Abra "professor.sql" no Bloco de Notas,
echo      copie tudo e cole no Console do banco D1
echo      no painel da Cloudflare
echo.
echo   3. Entre no site com esse codigo e PIN, e va
echo      para /professor no endereco
echo.
echo   Guarde esses dois como voce guarda uma senha.
echo.
pause
