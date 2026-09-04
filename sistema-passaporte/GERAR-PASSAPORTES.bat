@echo off
chcp 65001 >nul
cd /d "%~dp0.."

echo.
echo   ============================================
echo     PASSAPORTES DOS FIEIS DA CORUJA
echo   ============================================
echo.

if not exist "sistema-passaporte\turma.txt" (
  echo   Nao encontrei a lista de alunos.
  echo   Crie o arquivo turma.txt nesta pasta, com um nome por linha.
  echo.
  pause
  exit /b 1
)

echo   Vou usar os nomes que estao em turma.txt.
echo   Se quiser conferir antes, abra esse arquivo e feche esta janela.
echo.
set /p TURMA=  Nome da turma (ex: 7o B, pode deixar em branco):

echo.
python "sistema-passaporte\gerar_passaportes.py" --nomes turma.txt --turma "%TURMA%"

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
