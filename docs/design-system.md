# Figma implementation specification

Source: https://www.figma.com/design/NDDOCRl5s3OhpxpHnUFSDG/Untitled?node-id=0-1

Inspected with the official Figma connector on 12 October 2026. The file has one page, three desktop frames and one unplaced reference photograph. Every designed frame was inspected with `get_design_context`, screenshots, metadata, and a read-only Plugin API inspection. The unplaced reference is not part of a website section.

## Frames and hierarchy

| Frame | Node | Size | Website route |
|---|---|---|---|
| Home | 6:3 | 1440 × 1024 | `/` |
| Request a quote | 6:4 | 1440 × 1024 | `/quote/` |
| About | 10:2 | 1440 × 1024 | `/about/` |

Navigation specifies Services, Projects, About, Contact and Request a quote. Services, three service detail pages, an illustrative gallery, Contact, Privacy and 404 extend this hierarchy. Each content route has an English version under `/en/`.

## Exact source tokens

| Token | Figma value | Implementation |
|---|---|---|
| Paper | `#f4f3ee` | Same |
| Ink | `#080808` | Same |
| Blue | `#123cf0` | Same |
| Muted text | `#74746f` | `#686863` for small-text contrast |
| Divider | `#b8b8b2` | Same |
| About body | `#4a4a45` | Same |
| Body font | Arimo, 400 and 700 | Locally hosted original Google Fonts variable font |
| Display font | Roboto Condensed Black, 900 | Locally hosted original Google Fonts variable font |
| Desktop header | 72px | Same |
| Desktop content gutter | 61.2px | Fluid up to 61.2px |
| Content width | 1317.6px | Maximum content width |
| Home hero type | 86.4px / 1.05 | Same at 1440px; fluid below |
| Home description | 22.5px / 1.2 | Same on desktop |
| Quote headline | 64px / 1.05 | Same on desktop |
| Expertise heading | 44.1px / .96 | Same on desktop |
| Service heading | 18.9px | Same on desktop |
| Small body | 13.5px / 1.5 | Same on desktop; 15px on mobile expertise |
| Main CTA | 47.7px height, 24.3px horizontal padding | Same |
| Quote submit | 50.4px | Same |
| Form input | 42px | Same on desktop; 46px on mobile |
| Form border | .9px | Same |
| Selected option / CTA border | 1.35px | Same |

Spacing derives from Figma values: 6, 8, 9.9, 10.8, 12.6, 16.2, 18, 19.8, 21.6, 24, 27, 28.8, 32.4, 36, 47.7 and 54px. Added sections use the same spacing rhythm. Content-driven breakpoints: 600, 700, 900, 1000 and 1200px. Containers stop stretching at the source desktop width.

## Assets and placement

| Local original | Figma node | Used in |
|---|---|---|
| logo.png | 6:2, 7:5, 10:5 | Shared header |
| steel-structure.png | 4:1046, 7:41 | Hero and quote left column |
| machining.png | 4:1049 | Overlapping hero inset |
| connections.png | 4:1092 | First home gallery image |
| maintenance.png | 4:1093 | Second home gallery image |
| pipeline.png | 4:1094 | Third home gallery image |
| workshop.png | 18:10 | First About image |
| team.png | 18:12 | Second About image |
| iso-9001.png | 10:96 | First certificate card |
| iso-45001.png | 10:98 | Second certificate card |
| iso-14001.png | 10:97 | Third certificate card |
| arrow-blue.svg | 4:1096 | Outlined header CTA |
| arrow-white.svg | 4:1099 | Filled primary CTA |
| arrow-quote.svg | 19:5, 7:143 | Quote submit CTA |
| check.svg | 7:146 | Checked consent control |

Original image bytes remain in `src/assets/`. Astro generates responsive WebP variants at build time. SVG root dimensions remain unchanged. The logo arrived through the connector; remaining images were downloaded using the connector's URLs from an unrestricted user terminal after the Starter tool limit was reached. Temporary asset URLs are not shipped in code or this repository.

## Interactions

Six Figma prototype reactions link logos to Home, About navigation to About, and quote CTAs to the quote form. They use slide-in transitions from the bottom, 0.8–0.9 seconds, with varying easing. Progressive native cross-document view transitions use a 0.8-second bottom slide. Reduced-motion preferences disable it. The file contains no dropdown, carousel, gallery dialog, hover variant, tablet or mobile design. Accessible mobile disclosure navigation, gallery dialogs, form states and FAQ disclosures complete the implied website interactions.

## Deliberate corrections and additions

- The Home frame has a white 11.35px canvas offset and clips the bottom of its photograph strip. The website removes the accidental canvas offset and shows the complete strip.
- The About headline sits at y=0 beneath an opaque header in Figma. It is restored below the header, moving the following content slightly lower.
- Language links have at least 24px targets. Mobile inputs use 16px text to avoid automatic viewport zoom.
- The original consent checkbox is visually checked in Figma. Actual consent starts unchecked and must be selected by the visitor.
- Figma says attachments up to 10 MB; Web3Forms documents a 5 MB standard attachment limit. The interface accurately uses 5 MB. Attachment delivery requires the provider's Pro plan and remains an external configuration prerequisite.
- No company address, telephone, clients, prices, testimonials, project dates or additional certification claims are invented. Company founding and certificate content are carried over from the supplied design and were not independently verified. Gallery photographs are labeled illustrative.
- `test@mail.com` is the contact address requested by the user; it is identified as temporary. The provided Web3Forms key determines the delivery destination; the displayed email does not configure that destination.
- The footer, mobile layouts and missing pages are new compositions using the extracted visual system.
