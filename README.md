# Heral Metal

Static Astro website implemented from the supplied Figma design, with Macedonian and English content, responsive layouts and GitHub Pages deployment.

Repository: https://github.com/Bojan-Ivanovski/heral-metal

Production URL: https://bojan-ivanovski.github.io/heral-metal/ (deployment verification is recorded in `docs/verification.md`).

## Development

Requires Node.js 24 or newer. Dependencies are pinned in `package-lock.json`.

```sh
npm ci
npm run dev
npm run verify
```

The development URL includes `/heral-metal/`. `astro.config.mjs` derives owner and repository name from `GITHUB_REPOSITORY`, with the verified repository as its local default. `SITE_URL` and `BASE_PATH` can override hosting configuration. All links and metadata use centralized route helpers.

## Routes

`/`, `/services/`, `/services/metal-structures/`, `/services/machine-maintenance/`, `/services/gas-pipelines/`, `/projects/`, `/about/`, `/contact/`, `/quote/`, `/privacy/`.

Every content route is also available under `/en/`. `404.html`, `sitemap.xml`, `robots.txt` and `llms.txt` are generated at build time. Paths above are relative to the repository hosting base.

## Architecture

- Astro static generation with strict TypeScript; no hydrated client framework.
- Tailwind CSS 4 provides the theme and reset; shared component CSS handles precise Figma geometry and responsive layouts.
- Original Figma assets remain local; `astro:assets` generates responsive WebP sources.
- Arimo and Roboto Condensed fonts are locally hosted, compressed and subset for Latin and Cyrillic. Original font licenses are included.
- Shared header, footer, layout, buttons and photographs. Repeated content and translations live in `src/data/`.
- Small TypeScript scripts handle mobile menu state, native gallery dialogs and asynchronous quote submission.
- Semantic HTML, visible keyboard focus, native disclosures and dialogs, reduced-motion support, central SEO metadata, language alternates and structured data.

## Quote form

The form submits to Web3Forms using the supplied public access key. `PUBLIC_WEB3FORMS_KEY` can override it at build time; this is a browser identifier, not a secret. The access key's associated email determines delivery. The displayed `test@mail.com` address is the user-requested temporary contact and is marked accordingly.

Required fields are name, email, service, description and contact consent. Attachments are optional; allowed types are PDF, JPG, PNG and DWG, maximum 5 MB. Web3Forms attachment support requires a Pro subscription. Success is displayed only when the API returns an HTTP success and `success: true`; rejection or network failure preserves input and offers email contact. Native form submission also works without JavaScript. No visitor details are stored in browser local storage.

## Verification

```sh
npm run verify
npx playwright install --with-deps chromium
npm run test:browser
npm run test:performance
```

To use an installed compatible Chromium browser, set `BROWSER_EXECUTABLE`, e.g. `/opt/brave-bin/brave`. Browser tests check all 20 routes at 320, 375, 430, 768, 1024, 1280, 1440, 1920, 2560 and 3440px, run axe accessibility checks at 375 and 1440px, verify menu/gallery/form/FAQ/404 behavior and save screenshots. Submission tests mock the external API and send no real email. Performance checks save Lighthouse JSON and HTML reports for Home, About, Quote and English Services. Results go to ignored `test-results/` and are uploaded as CI artifacts.

## Deployment

Enable **Settings → Pages → Source → GitHub Actions**. The workflow in `.github/workflows/deploy.yml` runs on `main` pushes, pull requests and manual dispatch. It installs from the lockfile, checks types, builds, tests links/assets/form validation, runs browser and accessibility checks, collects Lighthouse reports, uploads the static Pages artifact and deploys using official GitHub actions. Pull requests verify without deploying. Deployment uses `pages: write` and `id-token: write`, with read-only repository contents permission.

See `docs/design-system.md` for the extracted specification, original asset mapping and documented visual corrections. See `docs/verification.md` for actual verification results and external prerequisites.
