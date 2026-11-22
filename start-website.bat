@echo off
title Life Audit - website running
cd /d "%~dp0"
echo.
echo  Starting your website. It opens in your browser in a few seconds.
echo  To stop the website, close this window.
echo.
start "" cmd /c "timeout /t 12 >nul & start http://localhost:3000"
call npm run dev
pause
