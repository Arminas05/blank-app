# CINDER — Shopify build handoff

**The theme is built.** `theme/` is a working Online Store 2.0 theme: zip its contents,
upload it, import `product-import.csv`, create six pages from `pages/`, paste `policies/`
into Settings → Policies. Step-by-step in `theme/README.md`. The rest of this document is
the reasoning behind it — read it before changing the offer or the claims.

The design lives in `CINDER Store.dc.html`. It is a single-file prototype: one component,
one router (`state.page`), inline styles only.

## Product name

**CINDER R1 Electric Grill Brush**, SKU `CND-R1`. The AliExpress keyword-stuffed title is
gone from the H1; keep the keywords in the product description and the SEO fields instead.
Domain to match: cindergrill.com (fallbacks: cinderbrush.com, getcinder.com).

## Fulfilment reality, decided

Direct from the manufacturing partner in Guangdong. Processing 1–2 business days, US
delivery 8–16 business days, express 5–9 for $19. **DDP**: the US de minimis exemption
ended 29 August 2025, so every parcel is dutiable — duty is paid by the store and priced
into the $67, and *Charge duties and import taxes at checkout* must be switched on in
Shopify for that to be true. No return required for most refunds, because return carriage
to Guangdong exceeds the product value. 60-day guarantee from delivery, 12-month warranty
on motor and cell, free cancellation within 12 hours. Full text in `pages/` and
`policies/`.

Repo convention: commit this design file and this document at the repo root, theme code
under `theme/`. Keep the prototype in the repo after launch — it is the spec for what the
sections are supposed to do.

---

## 1. Product + variant setup

**One product, one variant, one price: $67.00** (SKU `CND-BR-01`). No bundle ladder, no
replacement head as a separate SKU, no accessories at checkout. The only quantity control
is the qty stepper.

In the box (from the supplier's package artwork): brush body with built-in steel scraper,
rolling stainless wire head fitted, USB-C charging cable, work gloves, head-changing wrench.

Prototype source: `vlist()` in the logic class, price in cents via the `price` prop.

Because there is only one variant, use Shopify's default variant and skip the option
picker in `main-product.liquid` entirely.

### Metafields

| Namespace.key | Type | Used for |
|---|---|---|
| `cinder.spec_rows` | JSON | The 17-row specification table |
| `cinder.faq` | JSON | FAQ accordion (`{q, a}[]`) |
| `cinder.safety_warning` | Rich text | Red "never use on a hot grill" block |
| `cinder.grate_compat` | JSON | Porcelain/stainless/cast-iron compatibility table |
| `cinder.box_contents` | JSON | "In the box" list, reused on home and PDP |

Put the spec table and FAQ in metafields, not in section settings — they are reused on
the home page, the PDP and the FAQ page, and duplicating them means they drift.

---

## 2. Section map

Each row is one Liquid section file. Prototype line references are approximate anchors,
search the quoted heading text.

| Shopify section | Prototype source | Settings the merchant needs |
|---|---|---|
| `sections/hero-product.liquid` | Home hero, "Grill grates stripped clean in 90 seconds" | Headline variant (a/b/c), subhead, image, CTA label |
| `sections/spec-marquee.liquid` | Scrolling spec strip under hero | Repeatable text blocks, scroll speed |
| `sections/time-math.liquid` | "9 minutes × 3 cooks" calculator | Minutes-per-clean, cooks-per-month defaults |
| `sections/bristle-truth.liquid` | Dark section, "The thing you already googled" | Heading, body, link to Safety page |
| `sections/proof-video.liquid` | Sticky video panel | Video file, poster image, autoplay/mute toggles |
| `sections/how-it-works.liquid` | Three-step block | Repeatable step blocks (title, body, image) |
| `sections/grate-compat.liquid` | Compatibility table | Reads `cinder.grate_compat` |
| `sections/price-justification.liquid` | "$49 against a season of…" | Comparison rows as blocks |
| `sections/reviews.liquid` | Rating summary + review grid | See §3 |
| `sections/guarantee.liquid` | 60-day circle block | Guarantee days, body copy |
| `sections/faq.liquid` | Accordion | Reads `cinder.faq`, optional "show first N" |
| `sections/final-close.liquid` | 95% scroll close | Heading, body, CTA |
| `snippets/sticky-cta.liquid` | Mobile bottom bar | Threshold scroll %, label |
| `sections/main-product.liquid` | PDP: gallery, rating row, variant picker, qty, trust grid, specs | Standard product section + spec table block |

Home page order in the theme editor should match the prototype's three-depth structure:
hero → marquee → time math → bristle truth → proof video → how it works → compat →
price justification → reviews → guarantee → FAQ → final close.

---

## 3. Reviews — read this before wiring the app

The review copy currently in the prototype is **synthetic**. It is written to be
representative of what buyers in this category actually say (bristle anxiety, gift
purchases, battery charge time, porcelain marking, head replacement) so the layout and
the objection coverage can be designed against realistic content. It is not customer
testimony and must not go live as such.

Before launch, either:

1. Install a review app (Judge.me, Loox, Okendo) and let it own the section — the rating
   summary block, the star distribution and the per-card layout in this design all map
   directly onto Judge.me's `<div class="jdgm-widget">` markup; or
2. Import your own collected reviews as a CSV and keep this custom section.

Either way, delete the synthetic entries in `reviewData()`. FTC rules treat invented
testimonials as deceptive advertising, and the rating summary (4.7 / 1,842 ratings /
6,100+ sold) is a placeholder number set — swap it for your real store's figures.

The three social-proof numbers are exposed as tweakable props (`ratingValue`,
`reviewCount`, `soldCount`) so they can be set without touching markup; in Shopify they
become section settings, or read live from the review app's aggregate.

---

## 3b. Verified vs unverified product claims

Everything on the page now traces to one of three sources. Know which before you repeat a
figure in an ad.

**Verified from the supplier's package artwork and unit label:**
2000 mAh battery · ~1100 RPM single speed · USB-C charging · three-LED charge indicator ·
CE and FCC marks · rolling stainless wire head · built-in steel scraper · "DO NOT USE ON
HOT GRILL" printed on the scraper plate · box contents (head, cable, gloves, wrench).

**Removed because nothing supports them** (they were on the page and are now gone):
three-speed 150/250/350 RPM · 180° five-position pivot head · 2600 mAh battery ·
90-minute runtime · 3-hour charge time · 16.5 in / 1.9 lb dimensions · 390°F housing
rating · a second scouring-pad head · a $9.95 replacement head SKU.

**Still unverified and stated on the page — confirm before launch:**
runtime per charge (the page implies "a month of weekend cooking"), charge time,
splash resistance, Ohio warehouse and 24-hour dispatch, free US shipping economics at
$67, and the ~1100 RPM figure (the unit label reads `Speed 1100` without a unit).

**A supplier manual was supplied and does not match this product.** The PDF
(`uploads/S5fb31ef5c6734f9e93993c0ebcf5209ba.pdf`) is for a HOMEFISH CB-303
"Multifunctional Precision Cleaning Brush" — a manual, non-electric dual-head brush for
keyboards and phone ports, with nylon bristles and a 60°C maximum surface temperature. It
is not documentation for this tool. Do not use it for spec copy, and get the real manual
before writing safety text for the packaging insert.

---

## 4. What the prototype fakes

| Prototype behaviour | Real implementation |
|---|---|
| `addToCart` pushes to local state | `POST /cart/add.js`, then re-render the drawer from `/cart.js` |
| `buyNow` sets a label | Redirect to `/cart/{variant_id}:{qty}` or Shopify Dynamic Checkout |
| Cart drawer contents | `sections/cart-drawer.liquid` + Cart AJAX API |
| `submitContact` | Shopify contact form (`{% form 'contact' %}`) |
| `trackLookup` | Order status page link, or a tracking app (AfterShip / 17Track) |
| `state.page` router | Real Shopify page templates and URLs (see §5) |
| Prices as cents in JS | Liquid `money` filter, so currency and locale follow the store |
| Reveal/parallax via scroll handler + IntersectionObserver | Same code in `assets/motion.js`; respects `prefers-reduced-motion` |

---

## 5. Page → template map

| Prototype page | Shopify URL | Template |
|---|---|---|
| `home` | `/` | `templates/index.json` |
| `product` | `/products/cinder-electric-grill-brush` | `templates/product.json` |
| `faq` | `/pages/faq` | `templates/page.faq.json` |
| `safety` | `/pages/safety-and-care` | `templates/page.safety.json` |
| `shipping` | `/pages/shipping` | `templates/page.shipping.json` |
| `returns` | `/pages/returns` | `templates/page.returns.json` |
| `about` | `/pages/about` | `templates/page.about.json` |
| `contact` | `/pages/contact` | `templates/page.contact.json` |
| `track` | `/pages/track-order` | `templates/page.track.json` |
| `legal` | `/policies/privacy-policy`, `/policies/terms-of-service` | Shopify policy pages |

Use Shopify's built-in policy pages rather than a custom template — checkout links to
them automatically.

---

## 6. Design tokens

Inline in the prototype by design (it streams faster). When porting, lift these into
`assets/base.css` as custom properties:

```
--ink: #12100E;        /* headings, primary buttons */
--body: #57534E;       /* body copy */
--muted: #78716C;      /* secondary copy */
--faint: #A8A29B;      /* meta, labels */
--line: #E5E2DD;       /* borders */
--line-soft: #EDEAE5;  /* inner borders */
--surface: #FCFBFA;    /* raised panels */
--surface-warm: #F7F6F4;
--ember: #E8590C;      /* accent, CTA */
--ember-dark: #C2410C; /* CTA hover */
--warn: #B42318;       /* safety warning */
--warn-bg: #FEF6F5;
--ok: #1B7A4B;         /* verified badges */
--ok-bg: #EAF6EF;
```

Type: Schibsted Grotesk, weights 400/500/600/700/800. Load from Google Fonts with
`display=swap`, preconnect in `layout/theme.liquid`.

---

## 7. Open items before launch

1. Get the correct manual and spec sheet for THIS unit (see §3b) and confirm runtime,
   charge time and the RPM figure.
2. Replace all synthetic reviews and the aggregate rating (§3).
3. Have a lawyer write the real privacy policy and terms.
4. Confirm the fulfilment partner will actually ship DDP and hold to 1–2 day processing.
   The whole shipping page depends on it.
5. Shoot real product photography. Current images are AI renders and read as such under
   scrutiny; the demo video is supplier footage and needs a licence check.
7. Check unit economics. Landed cost is roughly $28–31 (the AliExpress link's own price
   parameters read EUR 34.70 list / 26.34 sale). At $67 with free US shipping and a
   long guarantee window, model returns and ad spend before committing to the price.
8. Decide what happens when a head wears out. The page now says to email support, because
   there is no replacement-head SKU. That is honest but it is an open support liability.
6. Test the porcelain-grate claim on a real porcelain grate and photograph the result.
