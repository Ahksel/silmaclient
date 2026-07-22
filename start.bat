@echo off
chcp 65001 >nul
cd /d "%~dp0silmaclient"

where cargo >nul 2>&1
if errorlevel 1 (
    echo.
    echo Serve installare Rust prima di continuare.
    echo Apri questo sito, scarica e installa, poi RIAVVIA il PC:
    echo.
    echo    https://rustup.rs
    echo.
    echo Dopo il riavvio, fai di nuovo doppio clic su start.bat
    echo.
    pause
    exit /b 1
)

if not exist config.development.toml (
    copy /Y config.example.toml config.development.toml >nul
    echo Configurazione creata automaticamente.
)

echo.
echo Avvio del client Silmaril...
echo Quando vedi "gateway listening", apri il browser su:
echo.
echo    http://127.0.0.1:8088/
echo.
echo Per chiudere il gioco: chiudi questa finestra oppure premi Ctrl+C
echo.

cargo run -- config.development.toml
echo.
pause
