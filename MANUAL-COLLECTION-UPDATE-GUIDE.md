# Manual collection update guide

Your public collection is read-only. The editor cannot write to GitHub.

## Update your collection

1. Open:

   `https://ruddinahmad.github.io/pitch-black-tracker/editor.html`

2. Select **Edit collection**.
3. Tap a card to add one copy, or use the **+** and **−** controls.
4. Select **Download collection.json**.
5. Open your GitHub repository:

   `https://github.com/ruddinahmad/pitch-black-tracker`

6. Open the `data` folder.
7. Select **Add file → Upload files**.
8. Upload the newly downloaded `collection.json`.
9. Confirm that GitHub says it will replace the existing file.
10. Select **Commit changes**.

GitHub Pages will normally publish the update within a few minutes.

## Security model

- Visitors can only read `data/collection.json`.
- The editor creates a download on their own computer and has no GitHub credentials.
- Only a GitHub account with write permission to your repository can publish changes.
- Do not place a GitHub token or password inside any website file.
