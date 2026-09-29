# VocabScape

Learn vocabulary by exploring visual scenes.

VocabScape is a small static web app for learning concrete vocabulary through images. Objects in each scene are mapped with polygons, then used in three practice modes:

- **Type** — an object is highlighted; type its name in the target language.
- **Click** — a target-language word is shown; click the matching object.
- **Explore** — click objects to reveal their vocabulary.

Current target languages:

- French
- Spanish

Current scenes:

- Garden
- Kitchen

## Run locally

No build step is required.

Open `index.html` directly, or serve the folder with any static server, for example:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## GitHub Pages

1. Push this folder to a GitHub repository.
2. In **Settings → Pages**, choose **Deploy from a branch**.
3. Select the `main` branch and `/ (root)`.
4. Save.

## Project structure

```text
vocabscape/
├── index.html
├── styles.css
├── app.js
├── assets/
│   └── garden.png
└── data/
    ├── languages.js
    └── scenes.js
```

## Add another language

1. Add the language in `data/languages.js`.
2. Add a matching `terms.<language-code>` entry to every object in `data/scenes.js`.
3. Each term supplies:
   - `display`: the answer shown to the learner.
   - `strictAnswers`: answers accepted in strict mode.
   - `looseAnswers`: answers accepted when strict mode is off.

The engine itself does not contain French- or Spanish-specific vocabulary.

## Add another scene

Add a new scene object in `data/scenes.js` with:

- an image path or URL,
- a list of objects,
- polygon coordinates normalized from `0` to `1`,
- translations for each supported language.

Polygon coordinates are independent of display size as long as the image keeps its natural aspect ratio.

## Progress

Progress is saved in browser `localStorage` and is stored separately for each language.

## Image credits

- Garden: generated for this project.
- Kitchen: EddieRider, *Kitchen interior design.jpg*, released to the public domain via Wikimedia Commons.

## Status

Early prototype. Scene geometry is intentionally data-driven so new rooms, objects and languages can be added without rewriting the learning engine.
