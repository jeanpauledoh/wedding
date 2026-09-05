# wedding

Raquel &amp; Jean-Paul — wedding invitation website. A static single-page app built with [Vite](https://vite.dev), no framework and no backend.

## Local development

```bash
npm install
npm run dev
```

Open the printed URL (default `http://localhost:5173`).

## Production build

```bash
npm run build   # outputs to dist/
npm run preview # serve the production build locally
```

## Deployment

Pushing to `main` triggers the GitHub Actions workflow in `.github/workflows/deploy.yml`, which builds the site and deploys it to GitHub Pages.

One-time setup: enable Pages in **Settings → Pages** and set the Source to **GitHub Actions**. A custom domain can be added later under the same settings.