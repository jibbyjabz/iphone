# My Pocket 📱

A personal **finances + work** app you can build, edit, and run entirely from your iPhone.

It's a **PWA** (Progressive Web App): plain web files that install to your home
screen, run full-screen, and work offline — no Mac, no Xcode, no App Store needed.
You edit the code from your phone (via Claude Code on the web) and the changes
deploy automatically.

## What's inside

| File | What it does |
|------|--------------|
| `index.html` | App layout: Home, Finances, Work tabs |
| `styles.css` | Dark, iOS-native-feeling styling |
| `app.js` | All the logic; data is saved on your device (localStorage) |
| `manifest.webmanifest` | Makes it installable as an app |
| `sw.js` | Service worker → instant load + offline |
| `icons/` | App icons (regenerate with `python3 scripts/make_icons.py`) |
| `.github/workflows/pages.yml` | Auto-deploys to GitHub Pages |

## Get it on your iPhone (one-time setup)

1. Merge this branch into `main` (or ask me to).
2. On GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Wait for the **Deploy to GitHub Pages** action to finish (Actions tab).
4. Open the published URL in **Safari** on your iPhone
   (it'll look like `https://jibbyjabz.github.io/iphone/`).
5. Tap **Share → Add to Home Screen**. Now it's an app icon. 🎉

## Run it locally (optional)

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Current features

- **Home** — net balance + open task count at a glance
- **Finances** — log income/expenses, running balance
- **Work** — simple task list with check-off

All data stays on your device. Nothing is uploaded anywhere.

## Ideas to grow it

Budgets & categories · recurring bills · charts · work hours/timesheet ·
export to CSV · Face ID lock. Just ask and I'll build the next piece.
