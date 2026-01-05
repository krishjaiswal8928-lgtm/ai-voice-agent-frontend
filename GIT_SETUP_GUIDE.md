# Quick Start Guide - After Git Installation

## Step 1: Check if Git Installation is Complete

Open a **NEW** PowerShell or Git Bash window and run:
```bash
git --version
```

If you see something like `git version 2.52.0`, Git is installed! ✅

---

## Step 2: Navigate to Project Directory

### If using PowerShell:
```powershell
cd C:\voice-agent-theme-update-app
```

### If using Git Bash:
```bash
cd /c/voice-agent-theme-update-app
```

---

## Step 3: Configure Git (One-time setup)

```bash
git config --global user.name "Krish Jaiswal"
git config --global user.email "your.email@example.com"
```

**Replace** `your.email@example.com` with your actual email!

---

## Step 4: Initialize Git Repository

```bash
git init
```

Expected output: `Initialized empty Git repository...`

---

## Step 5: Add All Files

```bash
git add .
```

This stages all files for commit (respecting .gitignore)

---

## Step 6: Check What Will Be Committed

```bash
git status
```

**Verify you DON'T see:**
- `.env` file
- `serviceAccountKey.json`
- `node_modules/`
- `.venv/`

If you see these, STOP and let me know!

---

## Step 7: Create First Commit

```bash
git commit -m "Initial commit: SpeaksynthAI voice agent platform"
```

---

## Step 8: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `speaksynthai-voice-agent`
3. Description: "AI Voice Agent Platform with 3CX Integration"
4. Visibility: **Private** (recommended)
5. **DO NOT** check "Initialize with README"
6. Click **"Create repository"**

---

## Step 9: Connect to GitHub

GitHub will show you commands. Copy and run them:

```bash
git remote add origin https://github.com/YOUR_USERNAME/speaksynthai-voice-agent.git
git branch -M main
git push -u origin main
```

**Replace** `YOUR_USERNAME` with your GitHub username!

---

## Step 10: Verify Upload

1. Go to your GitHub repository
2. Refresh the page
3. You should see all your code!
4. **CRITICAL:** Check that `.env` is NOT visible (security!)

---

## Next: Deploy to Vercel

Once code is on GitHub:

1. Go to https://vercel.com
2. Sign in with GitHub
3. Click "Add New..." → "Project"
4. Import your repository
5. Follow the deployment guide for configuration

---

## Troubleshooting

### "git: command not found"
- Git installation not complete yet
- OR you need to restart your terminal
- Try opening a NEW terminal window

### "Permission denied"
- Make sure you're in the correct directory
- Check file permissions

### ".env file is visible on GitHub"
- **IMMEDIATELY** delete the repository
- Run: `git rm --cached .env`
- Commit and push again
- **Rotate all API keys!**

---

## Need Help?

If you get stuck, let me know at which step and what error message you see!
