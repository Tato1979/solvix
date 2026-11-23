@echo off
title SOLVIX - Sistema de Gestao de Chamados

echo ==========================================
echo          SOLVIX - Central de Suporte
echo ==========================================
echo.

cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
    echo ERRO: Node.js nao foi encontrado.
    echo Instale o Node.js antes de executar o SOLVIX.
    echo https://nodejs.org/
    echo.
    pause
    exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
    echo ERRO: npm nao foi encontrado.
    echo Verifique a instalacao do Node.js.
    echo.
    pause
    exit /b 1
)

if not exist "package.json" (
    echo ERRO: package.json nao encontrado.
    echo Coloque este arquivo na pasta principal do projeto SOLVIX.
    echo.
    pause
    exit /b 1
)

echo Verificando e instalando dependencias...
call npm install
if errorlevel 1 (
    echo.
    echo ERRO: Nao foi possivel instalar as dependencias.
    pause
    exit /b 1
)

echo.
echo Iniciando o servidor SOLVIX...
echo Quando aparecer a mensagem de que o servidor esta rodando,
echo abra http://localhost:3000 no navegador.
echo.
call npm start

echo.
echo O servidor foi encerrado.
pause
