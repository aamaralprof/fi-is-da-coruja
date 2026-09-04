@echo off
chcp 65001 >nul
cd /d "%~dp0.."

echo.
echo   ============================================
echo     AS ETIQUETAS BATEM COM O BANCO?
echo   ============================================
echo.
echo   Pega alguns passaportes da folha que voce imprimiu
echo   e tenta entrar com eles no site, de verdade.
echo.

python "sistema-passaporte\gerar_passaportes.py" --conferir-banco

echo.
pause
