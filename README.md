# HPA Jungle Hub (GitHub Pages)

Jungle-themed splash → login → dashboard with:
- Pulsing logo (click to enter) + fade-out animation
- Ambient sound (starts on first interaction)
- Falling leaves + drifting mist
- Subtle parallax (mouse/touch + optional device tilt)
- Fake auth (demo) login transition to dashboard
- Mobile swipe gestures

## Run locally
Just open `index.html` in your browser.

## Deploy with GitHub Pages
1. Create a repo (e.g. `hpa-jungle-hub`)
2. Add `index.html`, `style.css`, `script.js`, `README.md`
3. (Optional) add audio file: `assets/jungle-ambience.mp3`
4. GitHub → Settings → Pages → Source: `main` / root
5. Open the Pages URL

## Replace the logo
Update this line in `index.html`:
`src="https://via.placeholder.com/320x320.png?text=HPA+TEAM"`
to:
`src="assets/hpa-logo.png"`
``
