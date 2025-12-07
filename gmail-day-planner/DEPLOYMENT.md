# GitHub Pages Deployment Guide

## Quick Setup

### 1. Push to GitHub
```bash
git add .
git commit -m "Add GitHub Pages deployment"
git push origin main
```

### 2. Enable GitHub Pages
1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under **Source**, select **GitHub Actions**

### 3. Done!
Your site will be live at: `https://YOUR_USERNAME.github.io/Lazy-Automation-week-2-/`

## Manual Build (Optional)
```bash
npm run build
```
The `dist` folder contains your production build.

## Troubleshooting
- Ensure repository name matches the `base` in `vite.config.ts`
- Check Actions tab for build errors
- Verify GitHub Pages is enabled in repository settings
