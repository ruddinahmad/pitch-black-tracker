# Pitch Black Collection Tracker

A personal, an unofficial, non-commercial Pokémon TCG: Mega Evolution—Pitch Black (ME05) master set collection tracker.

## Access model

- `index.html` is the public, read-only collection.
- `editor.html` edits only a temporary browser copy and downloads `collection.json`.
- `data/collection.json` is the published collection.
- Only people with write access to the GitHub repository can replace the published file.

There are no database credentials, API keys or passwords in this website.

## Update the public collection

1. Open `https://ruddinahmad.github.io/pitch-black-tracker/editor.html`.
2. Select **Edit collection** and update card quantities.
3. Select **Download collection.json**.
4. In GitHub, open the repository's `data` folder.
5. Replace `collection.json` with the downloaded file and commit the change.
6. GitHub Pages automatically publishes the new collection.

## Master-set structure

- 84 base cards
- 74 reverse holos
- 36 secret rares
- 194 total collection slots

## Hosting

This is a static website designed for GitHub Pages.

## Card artwork

Card artwork is loaded from Pokémon's official card-image CDN and is not included in this repository. This is an unofficial personal collection tracker. Pokémon and related names and artwork belong to their respective owners.

## Disclaimer

This is an unofficial, non-commercial, fan-made collection tracker. It is not affiliated with or endorsed by Nintendo, Creatures Inc., GAME FREAK, or The Pokémon Company. Pokémon, Pokémon character names, card artwork and related trademarks belong to their respective owners.
