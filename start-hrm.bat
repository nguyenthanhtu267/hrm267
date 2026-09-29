@echo off
title OmniHRM Enterprise SaaS Platform
echo ===================================================================
echo     KHOI DONG HE THONG QUAN TRI NHAN SU OMNIHRM ENTERPRISE SAAS
echo ===================================================================
echo.
set "PATH=C:\Program Files\nodejs;%PATH%"
echo Dang khoi chay web server tai http://localhost:3000 ...
echo Trinh duyet se tu dong mo hoac ban co the truy cap http://localhost:3000
echo.
start http://localhost:3000
call "C:\Program Files\nodejs\npm.cmd" run dev -- --port 3000 --host
pause
