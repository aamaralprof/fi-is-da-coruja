@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo.
echo   ============================================
echo     PUBLICAR O BLOG DA SOFIA
echo   ============================================
echo.
echo   Manda para o ar o worker e a pasta blog-sofia
echo   INTEIRA, do jeito que ela esta no seu disco.
echo.
echo   Por isso a conferencia abaixo: o que sobe e o
echo   que esta na pasta, commitado ou nao.
echo.

git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 (
  echo   Nao consegui falar com o git nesta pasta.
  echo   Publique so depois de entender o porque.
  echo.
  pause
  exit /b 1
)

echo   Consultando o GitHub...
git fetch origin >nul 2>&1

set SUJO=
for /f "delims=" %%i in ('git status --porcelain 2^>nul') do set SUJO=1

set PENDENTES=0
for /f "delims=" %%i in ('git rev-list --count origin/main..HEAD 2^>nul') do set PENDENTES=%%i

echo.
echo   --------------------------------------------
if defined SUJO (
  echo   [!] HA ALTERACOES NAO COMMITADAS
  echo.
  git status --short
  echo.
  echo       Elas VAO AO AR, mas nao estao no GitHub.
  echo       Se esta maquina se perder, nao ha como
  echo       reconstruir o que subiu.
) else (
  echo   [ok] Nada pendente na pasta
)
echo.
if not "%PENDENTES%"=="0" (
  echo   [!] %PENDENTES% COMMIT^(S^) AINDA NAO ENVIADOS
  echo.
  git log --oneline origin/main..HEAD
  echo.
  echo       O GitHub vai ficar atras do que esta no ar.
) else (
  echo   [ok] GitHub em dia
)
echo   --------------------------------------------
echo.

if defined SUJO goto PERGUNTAR
if not "%PENDENTES%"=="0" goto PERGUNTAR

echo   Tudo conferido: o que vai ao ar e exatamente
echo   o que esta guardado no GitHub.
echo.

:PERGUNTAR
set /p SEGUE=  Publicar agora? Digite S para sim, ou Enter para parar: 
if /i not "%SEGUE%"=="S" (
  echo.
  echo   Parado. Nada foi publicado.
  echo.
  pause
  exit /b 0
)

echo.
echo   Publicando. Pode abrir uma janela do navegador
echo   para voce entrar na Cloudflare.
echo.
npx wrangler deploy

if errorlevel 1 (
  echo.
  echo   Algo deu errado. Copie a mensagem acima e mostre ao Claude.
  echo.
  pause
  exit /b 1
)

echo.
echo   ============================================
echo     NO AR
echo   ============================================
echo.
echo   Confira em:
echo     https://blog-da-sofia.aamaral.workers.dev
echo.
echo   Se mexeu no banco, lembre que a migracao
echo   precisa ter sido aplicada ANTES desta publicacao.
echo.
pause
