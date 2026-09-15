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
echo   Depois disso voce vai precisar:
echo     1. colar "professor.sql" no Console do banco D1
echo     2. entrar no site e ir para /professor
echo.
echo   A migracao ja precisa ter sido aplicada no banco.
echo.
pause
cls

python "sistema-passaporte\gerar_passaportes.py" --professor

if errorlevel 1 (
  echo.
  echo   Algo deu errado. Copie a mensagem acima e mostre ao Claude.
  echo.
  pause
  exit /b 1
)

start "" "%~dp0saida"

echo   ============================================
echo     ANOTE AGORA, ANTES DE FECHAR
echo   ============================================
echo.
type "%~dp0saida\professor.txt"
echo.
echo   ============================================
echo.
pause
