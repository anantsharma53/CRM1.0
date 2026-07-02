@echo off
REM ======================================================================
REM  Microtech Computers CRM - one-click Windows build
REM  Produces: dist\MicrotechCRM.exe   (single-file offline installer)
REM ======================================================================
setlocal ENABLEDELAYEDEXPANSION
cd /d "%~dp0"

echo.
echo === Microtech Computers CRM - Windows Build ===
echo.

REM ---- 1) Python check ----
where python >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Python is not installed or not on PATH.
    echo         Install Python 3.11+ from https://www.python.org/downloads/
    pause & exit /b 1
)

REM ---- 2) Node/Yarn check ----
where yarn >nul 2>nul
if errorlevel 1 (
    where npm >nul 2>nul
    if errorlevel 1 (
        echo [ERROR] Node.js/yarn/npm not found. Install Node.js LTS.
        pause & exit /b 1
    )
)

REM ---- 3) Build React frontend ----
echo [1/4] Building React frontend...
pushd frontend
if exist node_modules ( echo   - deps already installed, skipping install ) else (
    where yarn >nul 2>nul && ( call yarn install ) || ( call npm install )
)
REM Force empty REACT_APP_BACKEND_URL so the build calls the SAME origin (offline mode)
set REACT_APP_BACKEND_URL=
where yarn >nul 2>nul && ( call yarn build ) || ( call npm run build )
if errorlevel 1 ( echo [ERROR] Frontend build failed. & popd & pause & exit /b 1 )
popd

REM ---- 4) Python venv + deps ----
echo [2/4] Preparing Python virtual environment...
if not exist .venv (
    python -m venv .venv
)
call .venv\Scripts\activate.bat
python -m pip install --upgrade pip >nul
pip install -r backend\requirements.txt
pip install pyinstaller uvicorn
if errorlevel 1 ( echo [ERROR] pip install failed. & pause & exit /b 1 )

REM ---- 5) PyInstaller ----
echo [3/4] Building MicrotechCRM.exe with PyInstaller...
if exist dist ( rmdir /s /q dist )
if exist build ( rmdir /s /q build )
pyinstaller --clean MicrotechCRM.spec
if errorlevel 1 ( echo [ERROR] PyInstaller failed. & pause & exit /b 1 )

echo [4/4] Done.
echo.
echo ==========================================================
echo   Built: %CD%\dist\MicrotechCRM.exe
echo   Double-click the .exe to launch the CRM offline.
echo   Your SQLite database will be created next to the .exe.
echo ==========================================================
echo.
pause
