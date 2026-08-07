# CINDER theme

Online Store 2.0 theme built from `../CINDER Store.dc.html`. Passes
`shopify theme check` clean (65 files, 0 offenses).

## Install

```bash
cd theme
zip -r ../cinder-theme.zip . -x '.*'
```

Then **Online Store → Themes → Add theme → Upload zip**. Or, with the Shopify
CLI and a store you are logged into:

```bash
cd theme
shopify theme push --unpublished
```

Do not publish it yet — the order below matters, because several sections read
data that does not exist on a fresh store.

## Order of operations

1. **Import the product.** Settings → Import → `../product-import.csv`.
   One product, one variant, `CND-R1`, $67.00.
2. **Attach the product images.** The CSV carries no image columns because the
   renders are local files, not URLs. Open the product and drag in, from
   `../uploads/`: `r1-hero.webp`, `r1-studio.webp`, `r1-in-use.webp`,
   `r1-lifestyle.webp`, `r1-action.webp`, `r1-detail.webp`. Order matters —
   the first becomes the PDP's main image and the rest become the thumbnails.
3. **Upload the video.** Content → Files → upload `../uploads/r1-proof.webm`
   **and** `../uploads/r1-proof.mp4`. Copy both CDN URLs.
4. **Create the metafields.** See `../metafields/README.md`. Five shop-level
   definitions in the `cinder` namespace. Sections fall back to their own
   blocks until these exist, so nothing breaks if you do this later — but the
   content will be the theme default rather than yours.
5. **Create the pages.** Online Store → Pages. One per file in `../pages/`,
   with the handle and template shown below.
6. **Paste the policies.** Settings → Policies, from `../policies/`.
7. **Point the theme at the product.** Theme settings → Brand → The product.
   Every buy button on the site reads this.
8. **Fill in the proof video URLs.** Home page → Proof video section → paste the
   WebM and MP4 URLs from step 3.
9. **Build the menus.** Navigation → main-menu and the three footer menus.
10. **Turn on duty collection.** Settings → Markets → Duties and import taxes →
    *Charge duties and import taxes at checkout*. The shipping page and the
    refund policy both promise DDP; without this switch that promise is false.
11. **Reviews.** See the warning below.
12. Publish.

## Pages and templates

| Page             | Handle             | Template               |
| ---------------- | ------------------ | ---------------------- |
| FAQ              | `faq`              | `page.faq`             |
| Safety and care  | `safety-and-care`  | `page.safety`          |
| Shipping         | `shipping`         | `page.shipping`        |
| Returns          | `returns`          | `page.returns`         |
| About            | `about`            | `page.about`           |
| Contact          | `contact`          | `page.contact`         |
| Track your order | `track-order`      | `page.track`           |

The handle must match exactly — Shopify picks the template by suffix, and a
mismatched handle silently falls back to the default `page` template.

## Reviews — read before publishing

`sections/reviews.liquid` ships with **no review content**. That is deliberate.
The prototype contained nine written-to-be-representative reviews; putting them
in a theme preset would push invented testimonials live the moment the section
is added, which is deceptive advertising under FTC rules.

Pick one:

- Install Judge.me, Loox or Okendo and add its app block to the Reviews section.
  The summary and card layout here get out of its way.
- Add Review blocks by hand from reviews you have actually collected.

The rating summary (4.7 / 1,842 ratings / 6,100+ sold) in theme settings is
still placeholder data. Replace it with real figures or switch the summary off.

## Sections

| Section                     | Where              | Notes                                        |
| --------------------------- | ------------------ | -------------------------------------------- |
| `hero-product`              | home               | A/B/C headline variants                      |
| `spec-marquee`              | home               | repeatable text, adjustable speed            |
| `routine`                   | home               | the four-step "you know how this goes"       |
| `bristle-truth`             | home               | dark section, links to safety page           |
| `proof-video`               | home               | WebM + MP4 sources, poster, lazy             |
| `how-it-works`              | home               | three steps with images                      |
| `kept-cut`                  | home               | kept/cut block list                          |
| `time-math`                 | home               | interactive, renders server-side first       |
| `inline-buy`                | home               | mid-page buy card + in-the-box list          |
| `grate-compat`              | home, PDP, safety  | reads `cinder.grate_compat`                  |
| `myths`                     | home               | claim/reality pairs                          |
| `price-justification`       | home               | paragraph blocks                             |
| `reviews`                   | home               | app block or manual; empty by default        |
| `guarantee`                 | home, PDP          | guarantee days setting                       |
| `faq`                       | home, PDP, FAQ     | reads `cinder.faq`, "show first N"           |
| `final-close`               | home               | closing CTA                                  |
| `main-product`              | PDP                | single-variant; warns if a 2nd is added      |
| `cart-drawer`               | every page         | re-rendered via Section Rendering API        |
| `snippets/sticky-cta`       | every page, mobile | shown past 700px scroll                      |

## What changed from the handoff

- **Fonts are self-hosted**, not loaded from Google. Schibsted Grotesk is a
  variable font (wght 400–900), so the whole range is two subset files in
  `assets/`, served from Shopify's CDN. One less third-party origin on first
  paint, and it clears theme check's `RemoteAsset` warning.
- **The proof video has an MP4 alongside the WebM.** iOS Safari does not
  reliably decode VP8 WebM; WebM alone would have shown a blank player to every
  iPhone visitor. WebM is still listed first, so browsers that support it take
  the smaller file.
- **Reviews ship empty** rather than with the prototype's synthetic set.
- **Metafields have block fallbacks** so the theme renders correctly before the
  metafields are created.
