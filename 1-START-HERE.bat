@echo off
title Life Audit - setting up your website
echo.
echo  ==============================================
echo    Life Audit - one-click setup
echo    Please keep this window open.
echo  ==============================================
echo.

set "TARGET=%USERPROFILE%\Projects\life-audit"
echo  Step 1 of 4: copying the website to %TARGET%
robocopy "%~dp0." "%TARGET%" /E /XO /XD node_modules .next /XF "1-START-HERE.bat" .env.local /NFL /NDL /NJH /NJS /NP >nul
copy /Y "%~dp0start-website.bat" "%TARGET%\start-website.bat" >nul
cd /d "%TARGET%"

echo  Step 2 of 4: checking for Node.js
where node >nul 2>nul
if not errorlevel 1 goto havenode
echo  Node.js is not installed yet. Installing it now - this happens only once.
winget install -e --id OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements
set "PATH=%PATH%;%ProgramFiles%\nodejs"
where node >nul 2>nul
if not errorlevel 1 goto havenode
echo.
echo  Node.js could not be installed automatically.
echo  Please install the LTS version from https://nodejs.org then run this file again.
pause
exit /b 1

:havenode
if not exist ".env.local" copy "env-template.txt" ".env.local" >nul

echo  Step 3 of 4: downloading the website's building blocks - takes a few minutes the first time
call npm install
if errorlevel 1 goto failed

echo  Step 4 of 4: starting your website. It opens in your browser in a few seconds.
echo  To stop the website, close this window.
start "" cmd /c "timeout /t 15 >nul & start http://localhost:3000"
call npm run dev
pause
exit /b 0

:failed
echo.
echo  Something went wrong while downloading. Take a screenshot of this window and send it to Claude.
pause
exit /b 1
