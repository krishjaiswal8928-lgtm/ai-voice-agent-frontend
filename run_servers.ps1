Write-Host "Starting both servers on localhost:8000" -ForegroundColor Green

# Start the Python backend server in the background
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python main.py" -WindowStyle Minimized

# Give the backend server a moment to start
Start-Sleep -Seconds 5

# Start ngrok to expose port 8000
Start-Process powershell -ArgumentList "-NoExit", "-Command", "ngrok http 8000" -WindowStyle Minimized

# Navigate to frontend directory and start the frontend server
Set-Location -Path "frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WindowStyle Minimized

Write-Host "Servers started successfully!" -ForegroundColor Green
Write-Host "Python backend: http://localhost:8000" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Yellow
Write-Host "Ngrok tunnel will be available at the ngrok URL" -ForegroundColor Yellow