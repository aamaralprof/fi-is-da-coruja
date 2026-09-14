@echo off
chcp 65001 >nul
cd /d "%~dp0.."

echo.
echo   ============================================
echo     MARCAR A TURMA DOS PASSAPORTES
echo   ============================================
echo.
echo   Poe o nome da turma nos passaportes que JA estao
echo   no banco, para eles aparecerem agrupados na sua
echo   area de professora.
echo.
echo   NAO cria codigo novo e NAO muda PIN nenhum. Le os
echo   codigos da folha de etiquetas que voce ja imprimiu
echo   e escreve so a coluna da turma.
echo.

if not exist "sistema-passaporte\saida\etiquetas.html" (
  echo   Nao encontrei a folha de etiquetas em saida\.
  echo   E dela que saem os codigos da leva que esta no banco.
  echo.
  pause
  exit /b 1
)

set /p TURMA=  Nome da turma (ex: 7o B): 

if "%TURMA%"=="" (
  echo.
  echo   Sem nome de turma nao ha o que marcar. Parado.
  echo.
  pause
  exit /b 0
)

echo.
python "sistema-passaporte\gerar_passaportes.py" --marcar-turma "%TURMA%"

if errorlevel 1 (
  echo.
  echo   Algo deu errado. Copie a mensagem acima e mostre ao Claude.
  echo.
  pause
  exit /b 1
)

echo   Abrindo a pasta com os arquivos...
start "" "%~dp0saida"

echo.
echo   ============================================
echo     O QUE FAZER AGORA
echo   ============================================
echo.
echo   1. Abra "turma.sql" no Bloco de Notas, copie tudo
echo      e cole no Console do banco D1
echo.
echo   2. Na sua area de professora, clique em
echo      "Importar nomes" e escolha "nomes.json"
echo.
echo      Os nomes ficam so naquele navegador. Nao sobem
echo      para a Cloudflare e nao entram no banco.
echo.
pause
