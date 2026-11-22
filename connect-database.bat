@echo off
title Life Audit - connect the database
cd /d "%~dp0"
echo.
echo  Paste the two values from Supabase (Project Settings - API).
echo  To paste in this window: right-click.
echo.
set /p SBURL=  Project URL: 
set /p SBKEY=  anon public key: 
(
echo NEXT_PUBLIC_SUPABASE_URL=%SBURL%
echo NEXT_PUBLIC_SUPABASE_ANON_KEY=%SBKEY%
echo NEXT_PUBLIC_SITE_NAME=Life Audit
echo NEXT_PUBLIC_SITE_URL=http://localhost:3000
) > .env.local
echo.
echo  Saved. Now close the website window and double-click start-website.bat again.
pause
