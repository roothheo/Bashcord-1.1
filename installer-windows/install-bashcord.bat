@echo off
:: Bashcord Auto-Installer for Windows
:: Lance l'installer PowerShell automatiquement

title Bashcord Auto-Installer

echo ╔══════════════════════════════════════════════════════════╗
echo ║                 BASHCORD AUTO-INSTALLER                  ║
echo ║       Installation complète automatique pour Windows     ║
echo ╚══════════════════════════════════════════════════════════╝
echo.

:: Vérifier si PowerShell est disponible
powershell -Command "exit 0" >nul 2>&1
if errorlevel 1 (
    echo ❌ PowerShell n'est pas disponible sur ce système.
    echo Veuillez installer PowerShell et réessayer.
    pause
    exit /b 1
)

:: Lancer l'installer PowerShell
echo 🚀 Lancement de l'installation automatique...
echo.

powershell -ExecutionPolicy Bypass -File "%~dp0install-bashcord.ps1"

echo.
echo Installation terminée!
pause 