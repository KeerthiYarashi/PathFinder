@echo off
echo Starting Backend...
cd Backend
call .\venv\Scripts\activate.bat
uvicorn main:app --reload
pause
