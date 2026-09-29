# Adding content to VocabScape

## Language schema

A language lives in `data/languages.js`.

Example:

```js
"de": {
  "name": "German",
  "nativeName": "Deutsch",
  "strictLabel": "Require article",
  "strictHint": "Include der / die / das.",
  "strictDefault": true
}
```

If a language does not need a strict/loose distinction, set `strictLabel` to `null`.

## Vocabulary schema

Every mapped object has one stable concept and language-specific terms:

```js
{
  "id": "tree",
  "concept": "tree",
  "points": [[0.1,0.1], [0.2,0.1], [0.2,0.3]],
  "terms": {
    "fr": {
      "display": "un arbre",
      "strictAnswers": ["un arbre"],
      "looseAnswers": ["un arbre", "arbre"]
    },
    "es": {
      "display": "un árbol",
      "strictAnswers": ["un árbol"],
      "looseAnswers": ["un árbol", "árbol"]
    }
  }
}
```

Keep geometry separate from language. The same polygon is reused for every language.

## Overlapping polygons

Polygons may overlap. In Click mode, VocabScape tests the click against the requested object's polygon directly, so a bench can overlap a lawn without becoming unclickable.
