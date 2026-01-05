@echo off
REM run.bat

echo Starting AI Voice Agent Platform...

REM Start the FastAPI application
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

pause