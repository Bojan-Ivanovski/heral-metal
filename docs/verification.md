# Verification record

## Local checks completed

- Official Figma connector inspected all three available desktop designs and prototype links.
- Original design images and icons are present locally; responsive WebP derivatives build successfully.
- `npm run check`: no Astro or TypeScript errors or warnings.
- `npm run build`: 21 static HTML pages, sitemap, robots and LLM content generated successfully.
- Seven tests cover attachment size/type boundaries, all 20 localized routes plus 404, unique metadata, structured data, local links, responsive sources, CSS assets, original files, sitemap URLs and local test-server error responses. All pass.
- Script syntax checks pass.
- Browser startup and localhost listening are blocked inside the workspace sandbox (`Operation not permitted`). Browser and Lighthouse suites are prepared for execution from a normal terminal and GitHub Actions; no successful full-suite result is claimed yet.
- The first user-run browser check flagged 320px text geometry. The measurement was refined to exclude decorative pseudo-elements and to collect screenshots and results across the entire viewport matrix. The refined suite is awaiting a complete run.

## Deployment

The public repository was created by the user and confirmed using the GitHub connector. The deployment workflow is prepared, with validation before publication. Repository upload, CI status and the live website will be recorded after verification.

## External prerequisites and limits

- A real Web3Forms submission and inbox delivery have not been verified. Automated form tests mock responses and send no email.
- File attachments need Web3Forms Pro support for the supplied key. The standard provider limit is 5 MB, reflected in the form.
- `test@mail.com` is intentionally temporary, as requested. It does not configure the email associated with the Web3Forms key.
- Company founding and certification content is reproduced from Figma, with no additional claims. No independent certificate verification or real project records were supplied.
- Automated accessibility checks complement but do not replace a manual screen-reader or WCAG conformance assessment.
