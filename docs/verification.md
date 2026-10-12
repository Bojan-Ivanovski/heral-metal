# Verification record

## Local checks completed

- Official Figma connector inspected all three available desktop designs and prototype links.
- Original design images and icons are present locally; responsive WebP derivatives build successfully.
- `npm run check`: no Astro or TypeScript errors or warnings.
- `npm run build`: 21 static HTML pages, sitemap, robots and LLM content generated successfully.
- Seven tests cover attachment size/type boundaries, all 20 localized routes plus 404, unique metadata, structured data, local links, responsive sources, CSS assets, original files, sitemap URLs and local test-server error responses. All pass.
- Script syntax checks pass.

## Deployment

The public repository was created by the user and confirmed using the GitHub connector. The deployment workflow is prepared, with validation before publication. Repository upload, CI status and the live website will be recorded after verification.

## External prerequisites and limits

- A real Web3Forms submission and inbox delivery have not been verified. Automated form tests mock responses and send no email.
- File attachments need Web3Forms Pro support for the supplied key. The standard provider limit is 5 MB, reflected in the form.
- `test@mail.com` is intentionally temporary, as requested. It does not configure the email associated with the Web3Forms key.
- Company founding and certification content is reproduced from Figma, with no additional claims. No independent certificate verification or real project records were supplied.
- Automated accessibility checks complement but do not replace a manual screen-reader or WCAG conformance assessment.

## Completed browser verification

Executed outside the sandbox on 2026-10-12 using the production build.

- 200 layout checks: all 20 routes at 320, 375, 430, 768, 1024, 1280, 1440, 1920, 2560 and 3440px. No horizontal overflow, clipped text or broken images.
- 40 axe checks at 375 and 1440px: no automated WCAG A/AA violations.
- Mobile menu, keyboard Escape, focus restoration and navigation
- Gallery open, arrow navigation, Escape and focus restoration
- Service preselection; required-field and file validation; mocked success, provider rejection and network failure; values retained after failure
- FAQ disclosure and 404 response
- Layout at 720 CSS pixels, equivalent to 200% zoom on a 1440px viewport
- No browser runtime errors or failed local resources.
- Screenshots of all three designed pages and added Services/Projects at 375, 1440 and 3440px were captured for review.

### Lighthouse mobile results

| Route | Performance | Accessibility | Best practices | SEO |
|---|---:|---:|---:|---:|
| home | 92 | 100 | 100 | 100 |
| about/ | 94 | 100 | 100 | 100 |
| quote/ | 95 | 100 | 100 | 100 |
| en/services/ | 96 | 100 | 100 | 100 |

Scores describe this run, not a guarantee under all networks and devices. Actual Web3Forms delivery is not exercised by mocked browser tests.
