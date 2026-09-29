# VocabScape

VocabScape is a visual vocabulary-learning app. It uses real scenes with clickable SVG hotspots so learners connect words to objects in context.

The app is built with **Svelte + TypeScript + Vite** and deployed to **GitHub Pages**.

## Current languages

- French
- Spanish

The language system is data-driven, so more languages can be added without rebuilding the learning interface.

## Current scenes

- Garden
- Kitchen

## Practice modes

- **Type** — a scene object is highlighted; type its target-language name.
- **Click** — a target-language word is shown; click the matching object.
- **Explore** — click objects to reveal their vocabulary.

Overlapping hotspots are ordered by area so smaller objects sit above larger regions and remain clickable.

## Run locally

```bash
npm install
npm run dev
```

Production checks:

```bash
npm run check
npm run build
```

## Project structure

```text
VocabScape/
├── .github/workflows/pages.yml
├── src/
│   ├── data/
│   │   ├── languages.js
│   │   └── scenes.js
│   ├── lib/
│   │   └── SceneView.svelte
│   ├── App.svelte
│   ├── app.css
│   └── main.ts
├── garden.png
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## GitHub Pages

Every push to `main` runs the Pages workflow. It builds the Svelte app, copies the local Garden artwork into the production bundle, and deploys `dist`.

The Vite base path is `/VocabScape/`.

## Adding a language

Add the language in `src/data/languages.js`, then add a matching `terms.<language-code>` entry to every object in `src/data/scenes.js`.

## Adding a scene

Add another scene in `src/data/scenes.js` with an image, vocabulary objects, normalized polygon coordinates, and terms for each language.

Progress is stored locally in the learner's browser.
