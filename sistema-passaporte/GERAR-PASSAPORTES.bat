@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0.."

echo.
echo   ============================================
echo     PASSAPORTES DOS FIEIS DA CORUJA
echo   ============================================
echo.

rem Arquivo arrastado e solto em cima deste atalho vem em %1.
if not "%~1"=="" (
  set "LISTA=%~1"
  echo   Lista recebida: %~nx1
) else (
  if not exist "sistema-passaporte\turma.txt" (
    echo   Nao encontrei nenhuma lista de alunos.
    echo.
    echo   Duas formas de resolver:
    echo     - arraste a lista da turma para cima deste atalho
    echo       ^(aceita Excel, PDF, Word, CSV ou texto^)
    echo     - ou escreva os nomes em turma.txt, um por linha
    echo.
    pause
    exit /b 1
  )
  set "LISTA=turma.txt"
  echo   Usando a lista de turma.txt
)

echo.
echo   Primeiro vou so mostrar os nomes que encontrei.
echo.
python "sistema-passaporte\gerar_passaportes.py" --nomes "%LISTA%" --conferir

if errorlevel 1 (
  echo.
  echo   Algo deu errado. Copie a mensagem acima e mostre ao Claude.
  echo.
  pause
  exit /b 1
)

echo.
set /p SEGUE=  A lista esta certa? Digite S para gerar, ou Enter para parar:
if /i not "%SEGUE%"=="S" (
  echo.
  echo   Parado. Nada foi gerado.
  echo   Se faltou ou sobrou alguem, mostre a lista acima ao Claude.
  echo.
  pause
  exit /b 0
)

echo.
set /p TURMA=  Nome da turma (ex: 7o B, pode deixar em branco):

echo.
python "sistema-passaporte\gerar_passaportes.py" --nomes "%LISTA%" --turma "%TURMA%"

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
echo   1. Abra "etiquetas.html" e imprima
echo   2. Confira os nomes, recorte e entregue
echo   3. GUARDE UMA VIA da folha. Ela e a unica
echo      ligacao entre codigo e aluno: o nome nao
echo      esta no banco de dados, so no papel.
echo.
echo   4. Abra "passaportes.sql" no Bloco de Notas,
echo      copie tudo e cole no Console do banco D1
echo      no painel da Cloudflare
echo.
pause
