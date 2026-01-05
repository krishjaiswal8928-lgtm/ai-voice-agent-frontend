@echo off
echo Starting both servers on localhost:8000

REM Start the Python backend server in the background
start "Python Backend Server" /min cmd /c "python main.py"

REM Give the backend server a moment to start
timeout /t 5 /nobreak >nul

REM Start ngrok to expose port 8000
start "Ngrok Tunnel" /min cmd /c "ngrok http 8000"

REM Navigate to frontend directory and start the frontend server
cd frontend
start "Frontend Server" /min cmd /c "npm run dev"

echo Servers started successfully!
echo Python backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo Ngrok tunnel will be available at the ngrok URL
pause