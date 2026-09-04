@echo off
chcp 65001 >nul
cd /d "%~dp0.."

echo.
echo   ============================================
echo     PASSAPORTES DOS FIEIS DA CORUJA
echo   ============================================
echo.
echo   Vai gerar duas coisas:
echo     - uma folha para imprimir e recortar
echo     - um texto para colar no banco
echo.

set /p QTD=  Quantos passaportes?
set /p TURMA=  Qual turma (pode deixar em branco)?

echo.
python "sistema-passaporte\gerar_passaportes.py" %QTD% --turma "%TURMA%"

if errorlevel 1 (
  echo.
  echo   Algo deu errado. Copie a mensagem acima e mostre ao Claude.
  echo.
  pause
  exit /b 1
)

echo.
echo   Abrindo a pasta com os arquivos...
start "" "%~dp0saida"

echo.
echo   ============================================
echo     O QUE FAZER AGORA
echo   ============================================
echo.
echo   1. Abra "lista-para-imprimir.html" e imprima
echo   2. Escreva o nome de cada aluno ao lado do codigo
echo   3. GUARDE essa folha: e a unica ligacao entre
echo      codigo e aluno. Ninguem mais tem essa lista.
echo   4. Recorte e entregue os cartoes
echo.
echo   5. Abra "passaportes.sql" no Bloco de Notas,
echo      copie tudo e cole no Console do banco D1
echo      no painel da Cloudflare
echo.
pause
