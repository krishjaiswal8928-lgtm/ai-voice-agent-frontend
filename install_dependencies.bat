@echo off
REM install_dependencies.bat

echo Installing Python dependencies...
pip install -r requirements.txt

echo Installing Node.js dependencies...
cd frontend
npm install

echo Dependencies installed successfully!

pause
