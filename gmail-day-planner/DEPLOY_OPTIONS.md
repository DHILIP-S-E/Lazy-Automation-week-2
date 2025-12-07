# Deployment Options for Gmail Day Planner

## Option 1: GitHub Pages (Recommended - Free)

### Setup Steps:
1. **Push code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**
   - Go to Settings → Pages
   - Source: GitHub Actions

3. **Your site**: `https://YOUR_USERNAME.github.io/YOUR_REPO/`

---

## Option 2: Netlify (Easy, Free)

### Setup Steps:
1. **Build locally**
   ```bash
   npm run build
   ```

2. **Deploy via Netlify CLI**
   ```bash
   npm install -g netlify-cli
   netlify login
   netlify deploy --prod
   ```

3. **Or drag & drop** `dist` folder to netlify.com/drop

---

## Option 3: Vercel (Fast, Free)

### Setup Steps:
1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

3. **Or connect GitHub repo** at vercel.com

---

## Option 4: Firebase Hosting (Google Integration)

### Setup Steps:
1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

2. **Initialize**
   ```bash
   firebase init hosting
   ```

3. **Deploy**
   ```bash
   npm run build
   firebase deploy
   ```
