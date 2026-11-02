@echo off
cd /d "%~dp0"
where python >nul 2>nul
if errorlevel 1 (
 echo Python 3 is required for local preview. Please see Website_Setup.pdf.
 pause
 exit /b 1
)
echo Open http://127.0.0.1:8000/ in your browser.
echo Keep this window open while previewing. Press Ctrl+C to stop.
python -m http.server 8000 --bind 127.0.0.1
pause
