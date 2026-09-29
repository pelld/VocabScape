# Contributing to VocabScape

VocabScape is a Svelte + TypeScript + Vite project.

## Local setup

```bash
npm install
npm run dev
```

Before committing:

```bash
npm run check
npm run build
```

## Main files

- `src/App.svelte` — app state and practice modes.
- `src/lib/SceneView.svelte` — image and clickable SVG hotspots.
- `src/data/scenes.js` — scene geometry and vocabulary.
- `src/data/languages.js` — supported languages.
- `src/app.css` — visual design.
- `.github/workflows/pages.yml` — GitHub Pages deployment.

Keep scene geometry data-driven and keep language-specific vocabulary out of the interface code.
