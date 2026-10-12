# Website consistency audit

The existing implementation is the visual authority. All 20 localized routes and the 404 page were captured and reviewed at 375, 768 and 1440px before application changes. The original assets, fonts, palette, content and route structure remain the baseline.

## Prioritized findings

| Affected area | Observed problem | Correction | Shared solution |
|---|---|---|---|
| Page navigation | A global navigation transition slides each new document into place for 0.8 seconds. | Remove cross-document animation and its header/pseudo-element hooks. | Global CSS cleanup; native links and browser history. |
| Header on every route | At 1440px the navigation begins at x470.7 on Home, x562.5 on Services and x506.5 on About. About also changes from 12.6px to 17.08px navigation type. Other pages shift actions 40px beyond the content gutter. | One header grid, navigation treatment and action alignment across routes. | Shared Header and layout rules. |
| Page and footer spacing | Introductions use independent 32, 36, 40 and 47.7px offsets; content-to-footer space varies between 31, 79 and 80px. | Use fluid page-start, page-end and section spacing, retaining extra breadcrumb rows and the full-width Home gallery. | Semantic spacing tokens. |
| About certificate section | Its heading starts 51px inside the card grid, with a separate 1214px width. At desktop, card heights are 225.5, 225.5 and 244.6px. The classification label is styled like a heading. | Align the section heading to its container, use the common label hierarchy and stretch cards within each row. | Shared typography and grid rules. |
| Services and process cards | Buttons follow text length instead of a common card baseline. Process descriptions begin at different heights when headings wrap. | Stretch card bodies and align actions; share row tracks for process content. | Flex card bodies and CSS subgrid with fallback. |
| Narrative content and media | Long About paragraphs span over 1300px. Privacy has an independent 900px reading width. About photographs retain a 220px height on tablet, producing much stronger crops than desktop/mobile. | Formalize reading and media widths; preserve the About image aspect ratio across widths. | Reading-width and media tokens. |
| Repeated introductions and controls | Services, Projects and Contact duplicate introduction markup. Button dimensions are repeated and service buttons shrink at laptop widths. Quote actions use inconsistent capitalization. | Share the introduction pattern and explicit default/compact button sizes; normalize action labels. | PageHeading, Button and typography tokens. |

## Intentional variations retained

- Standard content is capped at 1317.6px; the full-width Home showcase is capped at 1440px. Narrative media uses a 1280px cap; prose uses a character-based reading width.
- The Home three-line display, compact quote heading, service-detail display and About prose heading retain their existing roles and font families.
- The Home photograph overlap, certificate-card rounding and shadows, gallery viewer, quote service selections, attachment validation, FAQ disclosures and multilingual navigation remain.
- Header actions keep a compact size. Main actions use one default size. Gallery captions and form legends are supporting typography rather than large section headings.
- Existing thumbnail feedback remains, with reduced-motion support. Page navigation has no animation.

## Structural references

The supplied [HERMLE case study](https://www.schindlerparent.de/en/case/webrelaunch-for-hermle/), [industrial layout guide](https://redboxweb.co.uk/website-design/industrial-website-design-guide/) and [New Machinery Trading case study](https://pampart.com/projects/nmt-landing-onepage-website-design/) were read for information hierarchy, modular organization and clear technical journeys only. No reference branding, assets or page composition was adopted.

## Formalized implementation rules

| Role | Rule |
|---|---|
| Containers | Standard 1317.6px; showcase 1440px; narrative media 1280px; reading content 75ch. Existing fluid gutters cap at 61.2px. |
| Spacing | 4, 8, 12, 16, 20, 24, 32, 40, 48 and 64px scale. Page starts use 32–48px; page ends use 48–80px; major sections use 32–48px. |
| Grids | Shared gaps scale from 16 to 24px. Certificates stretch within each row. Service card actions align at the bottom. Process row tracks align on wider layouts; stacked cards use normal flow. |
| Display hierarchy | Existing condensed display font, weight 900 and line height 1.05. Standard page titles scale 40–80px; detail and reading titles 40–68px. The Home and quote displays keep their distinct compositions. |
| Supporting hierarchy | Section titles 26–40px; panel/card titles 24px; process headings 20px; body 16px; lead 17–22.5px; captions 13.5px; classification labels 12px. Prose headings retain the existing body-font treatment. |
| Actions | Default buttons 48px minimum height; compact header buttons 40px. Shared spacing, focus and primary/outlined treatments; sentence-case action labels. |
| Media | Original files unchanged. About media preserves its banner aspect ratio at every width. Service detail media and gallery thumbnails retain separate, purposeful ratios. Fullscreen viewer images use containment without thumbnail transforms or filters. |
| Motion | No cross-document opt-in, transition pseudo-elements, page keyframes or header transition names. Ordinary links and browser history work with default motion settings. Hover colors and functional menu feedback remain; reduced-motion preferences disable thumbnail zoom. |

## Verification

Fresh verification completed for this refinement on 2026-10-12:

- Every route (20 localized content pages plus 404) was visually reviewed before and after at 375, 768 and 1440px: 63 captures per stage, with measurements and contact sheets. Files are in `test-results/consistency/`.
- 210 production-browser layout checks at 320, 375, 430, 768, 1024, 1280, 1440, 1920, 2560 and 3440px. No detected horizontal overflow, clipped headings/text, broken images, grid overlaps or misaligned card rows.
- 210 header/footer consistency checks across the same route/viewport matrix.
- 42 axe WCAG A/AA checks at 375 and 1440px, with zero violations.
- Default-motion navigation and Back/Forward, menu Escape/focus, gallery controls and focus restoration, form validation and mocked success/rejection/network failure, FAQ and 404 checks pass.
- 720 CSS-pixel reflow checks on Home, About and Quote pass.
- 36 additional layout checks around every responsive boundary (599/600, 699/700, 899/900, 999/1000, 1199/1200 and 1439/1441px); varied-length service card titles/descriptions retain aligned actions; gallery controls work at 320×568 and 768×375.
- Astro/TypeScript: zero errors, warnings or hints. Production build and all eight static/form/server/transition regression tests pass. There is no separate lint command in this project.
- Original media, branding, font files, dependency manifest and lockfile are unchanged.

### Fresh local Lighthouse mobile audit

| Route | Performance | Accessibility | Best practices | SEO |
|---|---:|---:|---:|---:|
| home | 92 | 100 | 100 | 100 |
| about/ | 94 | 100 | 100 | 100 |
| quote/ | 94 | 100 | 100 | 100 |
| en/services/ | 96 | 100 | 100 | 100 |

All four local audits report zero layout shift and zero blocking time. The first audit process terminated after Home; the fresh retry completed all four routes successfully. Scores are measurements of this run. Automated checks do not establish full WCAG conformance; a manual screen-reader audit and real Web3Forms inbox delivery were not performed. No email was sent by the tests.

### GitHub verification and live checks

[GitHub Actions run 38320838046](https://github.com/Bojan-Ivanovski/heral-metal/actions/runs/38320838046) passed build, all 210 layout checks, all 210 consistency checks, all 42 accessibility checks, interaction tests and deployment for implementation commit `2691455642299478386117ef8fe04f1a2a2b1cad`. All 24 live route/resource checks passed, and the deployed homepage matched the production HTML byte for byte.

CI Lighthouse performance was 84 for Home, 94 for About, 95 for Quote and 96 for English Services. Accessibility, best practices and SEO were 100 on all four pages. Home's simulated blocking time was 368ms in CI versus 0ms locally; layout shift was zero in both. The prior deployment's CI Home score was 92, so the 90+ performance target is not consistently demonstrated across these runs. This difference is retained in the record; its cause has not been established. No branding, imagery or typography asset replacement was made to change benchmark scores.
