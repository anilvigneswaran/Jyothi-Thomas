# JYOTHI THOMAS — Production-Ready Portfolio

An award-level, scroll-driven personal portfolio for **Jyothi Thomas** (Computer Teacher & Computer Science Educator, MTech CS). Built with Vite, React, TypeScript, Lenis smooth scrolling, GSAP ticker, custom 3D CSS perspective, and real-time canvas frame streaming.

---

## 🚀 Quick Deployment Guide

This package is **100% self-contained and pre-built**. All file references, scripts, styles, fonts, WebP video frames, and résumé downloads use **strict relative paths (`./`)**, meaning the site works out-of-the-box in any root domain or subdirectory.

---

### Option 1: GitHub Pages (Recommended — Free & 2 Minutes)

1. **Create a GitHub Repository**:
   - Go to [GitHub.com](https://github.com) and create a new repository (e.g., `jyothi-portfolio` or `<your-username>.github.io`).

2. **Upload Files**:
   - Unzip `website-production-ready.zip`.
   - Upload all files from the root of the unzipped folder into your GitHub repository `main` branch.
   - *(Note: Ensure `.nojekyll` and `index.html` are at the repository root).*

3. **Enable GitHub Pages**:
   - In your repository, click **Settings** (gear icon) → **Pages** (in the left sidebar).
   - Under **Build and deployment → Source**, select **Deploy from a branch**.
   - Under **Branch**, select `main` and folder `/ (root)`.
   - Click **Save**.

4. **Your Site is Live**:
   - Within 60 seconds, GitHub Pages will deploy your site at:  
     `https://<your-username>.github.io/<repository-name>/`

---

### 🌐 Connecting Your Custom Domain (e.g., `jyothithomas.com`)

1. **In your repository**:
   - Rename `CNAME.example` to `CNAME` (remove the `.example` extension).
   - Edit the file so it contains only your domain name, e.g.:
     ```txt
     jyothithomas.com
     ```
   - Commit and push the change.

2. **In your Domain Registrar (GoDaddy, Namecheap, Cloudflare, Google Domains, Hostinger, etc.)**:
   - Go to your domain's **DNS Management** page.
   - Add four **A Records** for `@` (apex domain):
     - `185.199.108.153`
     - `185.199.109.153`
     - `185.199.110.153`
     - `185.199.111.153`
   - Add a **CNAME Record** for `www`:
     - **Name**: `www`
     - **Target**: `<your-username>.github.io`

3. **Enable HTTPS**:
   - In GitHub repository **Settings → Pages**, wait for DNS verification, then check **Enforce HTTPS**.
   - Your custom domain is now live with free automated SSL encryption!

---

### Option 2: Netlify (Drag & Drop — Instant)

1. Log in to [Netlify.com](https://app.netlify.com).
2. Go to **Sites** → **Add new site** → **Deploy manually**.
3. Drag and drop the unzipped folder directly into the Netlify browser window.
4. Your site is instantly live with a custom Netlify URL and free automatic SSL. You can link your custom domain under **Domain Management**.

---

### Option 3: Vercel / Cloudflare Pages

1. Push this folder to a GitHub repository.
2. In [Vercel](https://vercel.com) or [Cloudflare Pages](https://pages.cloudflare.com), click **Add New Project** and select your repository.
3. If deploying from the pre-built files:
   - Framework preset: **Other** / Static.
   - Output directory: `.` (root).
4. If building from source:
   - Root directory: `source/`
   - Build command: `npm run build`
   - Output directory: `dist`

---

## 📁 Project Structure

```
website-production-ready/
├── index.html            # Production entry point (all relative paths)
├── 404.html              # SPA fallback routing
├── .nojekyll             # Tells GitHub Pages to serve all files directly
├── CNAME.example         # Template for custom domain connection
├── resume.pdf            # Downloadable CV
├── assets/               # Production JS, CSS, and webfonts
│   ├── index-*.js        # Minified production script bundle
│   ├── index-*.css       # Production styles
│   └── *.woff2 / *.woff  # Self-hosted Anton, JetBrains Mono & Inter Tight fonts
├── frames/               # 239 optimized scroll-driven WebP frames
│   ├── manifest.json     # Frame boundaries, bounding boxes, cx alignment
│   ├── lg/               # 239 Desktop HD frames (f000.webp - f238.webp)
│   └── sm/               # 239 Mobile optimized frames
├── source/               # Complete development source code
│   ├── src/
│   │   ├── data.ts       # All portfolio content, roles, timeline & stats
│   │   ├── styles.css    # Global typography, grid & CSS 3D styles
│   │   ├── components/   # Stage (canvas), Chrome (HUD & cursor), Odometer, TiltCard
│   │   ├── scenes/       # Hero, About, Work, Journey, Skills, Awards, Contact
│   │   └── engine/       # director.ts (scroll engine), frames.ts, hooks.ts
│   ├── public/           # Static asset source files
│   ├── package.json      # NPM dependencies & build scripts
│   ├── tsconfig.json     # TypeScript configuration
│   └── vite.config.ts    # Vite bundler configuration (base: './')
└── README.md             # This deployment manual
```

---

## 🛠️ Local Development & Editing (Optional)

If you wish to edit the source code, modify content, or re-compile the build:

1. **Install Node.js**: Ensure Node.js (v18+) is installed on your computer.
2. **Open the source directory**:
   ```bash
   cd source
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Start local development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` (or the port shown) in your browser with live hot-reloading.
5. **Build for production**:
   ```bash
   npm run build
   ```
   This generates an optimized static build in `source/dist/`.
