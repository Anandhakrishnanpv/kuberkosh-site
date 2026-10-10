# KuberKosh Industrial Solutions — website (static build)

This folder is the finished website, ready for **GitHub Pages**. No build step is needed.

## Publish
1. Create a new repository on GitHub and upload **everything in this folder** (index.html must be at the top level).
2. Settings → Pages → Build and deployment → Source: **Deploy from a branch** → Branch: **main**, folder **/ (root)** → Save.
3. After a minute the site is live at `https://<your-account>.github.io/<repo>/`.

Custom domain: Settings → Pages → Custom domain (then add the DNS record GitHub shows and tick *Enforce HTTPS*).

## Editing
Do not edit these files by hand — they are generated. Edit the source project (`kuberkosh-site/src`), then run
`npm run export` and upload the new files.
