# Flags of the World

Browse every flag, learn them in small regional units, and test yourself with quizzes, a map game and a daily flag.

The site is static: `index.html` plus `map.json`, which holds the map shapes and loads the first time a map is shown. A service worker (`sw.js`) caches the site so it works offline and can be installed to a phone's home screen. No server, database or API keys. Progress (quiz history, spaced repetition, learned units, daily streaks) is saved in each visitor's browser with `localStorage`.

## Run it locally

Serve the folder, then open http://localhost:3000:

```sh
npm run serve
```

The service worker is turned off on `localhost`, so you always see your latest build. Opening `index.html` straight from disk also works, except for the maps: browsers block loading `map.json` from a `file://` page.

## Edit and rebuild

`index.html`, `map.json` and `sw.js` are generated. Edit the sources, then rebuild:

```sh
npm install
npm run build
```

| Path | What it holds |
| --- | --- |
| `src/template.html` | Page markup, styles and app code |
| `data/curated.js` | Style tags, flag families, lookalike groups, alternate names, flag stories |
| `data/curated2.js` | More flag stories and lookalike tips |
| `data/units.js` | Learn units, spotting notes and comparisons |
| `data/pron.js` | Pronunciation respellings, notes and speech hints |
| `data/daily.js` | Daily flag schedule. Append new codes only; never reorder |
| `vendor/country-flags/svg` | Flag artwork |
| `src/sw.js` | Service worker source; the build stamps in a version and writes `sw.js` |
| `manifest.webmanifest`, `icons/` | App name and icons for installing. Regenerate icons with `node scripts/icons.js` |
| `og.png` | Social preview image. Regenerate with `node scripts/og.js` after a build |
| `scripts/` | Build steps: optimize flags and measure colors, project the maps, merge data, write `index.html` and `map.json` |

## Deploy

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds the site from source and deploys it to GitHub Pages (Settings, Pages, Source: GitHub Actions). The deployed site always comes from a fresh build; the workflow warns if the committed `index.html` or `map.json` is out of date.

Any other static host works too: serve `index.html`, `map.json`, `og.png`, `sw.js`, `manifest.webmanifest` and `icons/` from one folder.

## License

Code: [MIT](LICENSE). Country data: the data built into `index.html` is derived from world-countries and offered under the [Open Database License](https://opendatacommons.org/licenses/odbl/1-0/). Flag artwork and map shapes: public domain. See [LICENSE](LICENSE) for details.

## Credits

- Flag artwork: [hampusborgos/country-flags](https://github.com/hampusborgos/country-flags), public domain
- Country data: [mledoze/countries](https://github.com/mledoze/countries) (world-countries), Open Database License
- Map shapes: [world-atlas](https://github.com/topojson/world-atlas) from Natural Earth, public domain
