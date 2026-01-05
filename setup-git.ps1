# Git Setup Script for SpeaksynthAI
# Run this after Git is installed and you've reopened PowerShell

Write-Host "=== SpeaksynthAI - Git Setup ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Configure Git
Write-Host "Step 1: Configuring Git..." -ForegroundColor Yellow
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
Write-Host "✓ Git configured" -ForegroundColor Green
Write-Host ""

# Step 2: Initialize repository
Write-Host "Step 2: Initializing Git repository..." -ForegroundColor Yellow
git init
Write-Host "✓ Repository initialized" -ForegroundColor Green
Write-Host ""

# Step 3: Add all files
Write-Host "Step 3: Adding files to Git..." -ForegroundColor Yellow
git add .
Write-Host "✓ Files added" -ForegroundColor Green
Write-Host ""

# Step 4: Check status
Write-Host "Step 4: Checking status..." -ForegroundColor Yellow
git status
Write-Host ""

# Step 5: Create initial commit
Write-Host "Step 5: Creating initial commit..." -ForegroundColor Yellow
git commit -m "Initial commit: SpeaksynthAI voice agent platform"
Write-Host "✓ Initial commit created" -ForegroundColor Green
Write-Host ""

Write-Host "=== Git Setup Complete! ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Create GitHub repository at https://github.com/new"
Write-Host "2. Run: git remote add origin https://github.com/YOUR_USERNAME/speaksynthai-voice-agent.git"
Write-Host "3. Run: git branch -M main"
Write-Host "4. Run: git push -u origin main"
Write-Host ""
