@echo off
title Waldrige Renovation LLC - Sistema de Control de Horas
echo ========================================================
echo   Iniciando Waldrige Renovation LLC...
echo ========================================================
echo Abriendo aplicacion en tu navegador...
start http://localhost:8000
python -m http.server 8000
pause
