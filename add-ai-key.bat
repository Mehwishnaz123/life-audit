@echo off
title Life Audit - add AI key
echo.
echo  Life Audit: connect the AI Coach and AI Planner
echo  ----------------------------------------------
echo  1. Open https://aistudio.google.com/apikey and copy your key.
echo  2. Right-click in this window to paste it, then press Enter.
echo.
set /p KEY=Paste your Gemini key here: 
if "%KEY%"=="" (echo No key entered. Nothing changed. & pause & exit /b)
cd /d "%USERPROFILE%\Projects\life-audit"
if exist .env.local (findstr /v /b "GEMINI_API_KEY=" .env.local > .env.tmp) else (type nul > .env.tmp)
echo GEMINI_API_KEY=%KEY%>> .env.tmp
move /y .env.tmp .env.local >nul
echo.
echo  Done! The key is saved only on this computer (it is never uploaded to GitHub).
echo  Now close the website window and double-click start-website.bat again.
echo.
pause
