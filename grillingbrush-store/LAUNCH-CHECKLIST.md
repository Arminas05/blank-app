# GrillingBrush — launch checklist and build findings

Everything in this repo is built and verified as far as it can be without a
store connection. This document covers what was found along the way, what is
still blocked, and what must be true before you take money.

---

## Status

| Piece | State |
| --- | --- |
| Prototype (`GrillingBrush Store.dc.html`) | Working, boots offline, verified in headless Chromium |
| Shopify theme (`theme/`) | Built, `shopify theme check` clean — 65 files, 0 offenses |
| Product import (`product-import.csv`) | Corrected, 3 fixes applied |
| Page copy (`pages/`) | 7 pages, ready to paste |
| Policies (`policies/`) | 4 documents, 2 are placeholders needing a lawyer |
| Metafields (`metafields/`) | 5 payloads, JSON validated |
| Media (`uploads/`) | 7 WebP images + WebM **and** MP4 video |
| Applied to a live store | **Not done — connector blocked** |

---

## Blocked: the Shopify connector

The Shopify MCP connector returns `requires re-authorization (token expired)`,
and this session is non-interactive so the OAuth round-trip cannot run here.
Nothing has been read from or written to any store.

To unblock, reconnect Shopify in your claude.ai connector settings (or run
`/mcp` in an interactive session). Once it is live, the remaining work is the
numbered runbook in `theme/README.md` — importing the product, uploading media,
creating the metafields and pages, and pointing the theme at the product.

You also mentioned you had already uploaded a theme to the store. I could not
check what is there, so before publishing this one, confirm whether it should
replace the existing theme or sit alongside it as an unpublished draft.

---

## Media

You asked for images as WebP and the video kept as WebM.

**Images were already WebP** — all seven, extracted straight from the design
bundle in that format. Re-encoding them would have been generation loss for no
gain, so they are untouched:

| File | Dimensions | Size |
| --- | --- | --- |
| `r1-hero.webp` | 1254×1254 | 115 KB |
| `r1-studio.webp` | 1254×1254 | 73 KB |
| `r1-in-use.webp` | 1254×1254 | 237 KB |
| `r1-lifestyle.webp` | 1254×1254 | 187 KB |
| `r1-action.webp` | 1254×1254 | 91 KB |
| `r1-detail.webp` | 1122×1402 | 142 KB |
| `r1-proof-poster.webp` | 1254×1254 | 135 KB |

**The video is kept as WebM, with an MP4 added next to it.** This is a
deliberate departure from "keep webm" and it matters: the source is VP8/Vorbis,
and iOS Safari does not reliably decode VP8. Shipping WebM alone would have
shown every iPhone visitor a blank player on the proof section — on a
storefront that is a large share of traffic.

The `proof-video` section lists WebM first, so Chrome and Firefox still take the
smaller file and only Safari falls through to the MP4:

| File | Codec | Size |
| --- | --- | --- |
| `r1-proof.webm` | VP8 / Vorbis, 1280×720, 84 s | 12 MB |
| `r1-proof.mp4` | H.264 / AAC, 1280×720, 84 s | 14 MB |

Separately: Shopify's native **product media** accepts only MP4/MOV, so the WebM
cannot be attached to the product as a video. Both files go to
**Content → Files** and the section references them by CDN URL.

---

## Fixes applied to `product-import.csv`

The original is preserved as `product-import.original.csv`.

1. **`Product Category` had an HTML-escaped ampersand** — `Home &amp; Garden >
   Kitchen &amp; Dining`. CSV is not HTML; Shopify matches this literally
   against its taxonomy, so it would have failed to match and imported with no
   category, silently. Corrected to `Home & Garden > Kitchen & Dining`.
2. **`SEO Title` and `SEO Description` were missing.** The handoff explicitly
   says to keep the keywords out of the H1 and put them in the SEO fields
   instead; there were no SEO columns at all to put them in. Added:

   - Title (45 chars): `GrillingBrush — Cordless Electric Grill Brush`
   - Description (151 chars): *The grill brush with a motor. A rolling stainless
     head lifts baked-on carbon in 90 seconds, and detaches so you can inspect
     the wire. 60-day guarantee.*

   Both sit inside Google's truncation limits (~60 and ~155). The title no
   longer needs a separate brand suffix, because the brand *is* the first
   word now.

   Worth knowing what you have traded: a descriptive brand like this is an
   exact-match keyword, so the name itself earns traffic. The cost is
   trademark strength — you cannot stop a competitor describing their product
   as a grilling brush, so the name is hard to defend and hard to own
   outright. That is a positioning trade, not an SEO mistake, and it is a
   reasonable one for a single-product store. Just do not expect exclusivity
   on the term.
3. **`Cost per item` added** at $29.50, the midpoint of the $28–31 landed cost
   in handoff §7. Without it Shopify cannot report margin.

---

## Contradictions found in the handoff

These need your decision — I made a call on each and noted it, but they are
documentation conflicts, not code bugs.

1. ~~**SKU.**~~ **Settled by the rename.** The handoff carried two SKUs
   (`CND-R1` on line 13, `CND-BR-01` on line 36). Both are dead now — the SKU
   is **`GB-R1`**, and nothing has been imported, so there is no cost to it.
2. ~~**Product URL.**~~ **Settled by the rename.** The old candidates were
   `cinder-electric-grill-brush` (§5) and `cinder-r1-electric-grill-brush`
   (the CSV). Neither survives. The handle is now **`electric-grill-brush`**,
   which gives `grillingbrush.com/products/electric-grill-brush` — the brand
   is already in the domain, so repeating it in the path would only have
   duplicated the keyword.
3. **Spec table row count.** §1 calls it "the 17-row specification table"; the
   prototype has 15 rows. `metafields/spec_rows.json` has all 15. If two rows
   were dropped somewhere, they are not in the prototype to recover.
4. **`theme/` was described as already built.** The handoff opens with "The
   theme is built" and points at `theme/README.md`, `pages/` and `policies/`.
   None of those existed in anything provided — the design project export
   contained only the prototype, its assets and the runtime. They have now been
   built from the prototype.

---

## Deliberate departures from the handoff

- **Reviews ship empty.** §3 says the nine reviews in the prototype are
  synthetic and must not go live. Putting them in a theme preset would have
  published them the moment the section was added, so `sections/reviews.liquid`
  ships with no review content, an `@app` block slot for Judge.me/Loox/Okendo,
  and an editor-only warning. The 4.7 / 1,842 / 6,100 figures are still
  placeholders in theme settings — replace or switch the summary off.
- **Fonts are self-hosted, not from Google.** §6 assumed Google Fonts. Schibsted
  Grotesk turned out to be a variable font (weight axis 400–900), so the entire
  range is two subset files now served from Shopify's own CDN. One less
  third-party origin on first paint.
- **Metafield-backed sections fall back to blocks.** §1 wants the spec table,
  FAQ and compatibility table in metafields. They are — but each section also
  has block defaults, so the theme renders correctly before you create them.

---

## Still open before launch

**Rename the Shopify store to GrillingBrush.** It is currently **"My Store 2"**,
and that name is not internal — it reaches customers through the browser tab,
order confirmation emails, the checkout header and the packing slip.

It also costs you title space. The theme appends the shop name only when the
title does not already contain it, so today the product page renders:

```
GrillingBrush — Cordless Electric Grill Brush – My Store 2     (58 chars)
```

That still squeaks under Google's ~60-character cut-off, so it will not be
truncated — but 13 of those characters are spent on a placeholder. Rename the
store in **Settings → Store details** and the append vanishes on its own,
leaving the clean 45-character title. No theme change needed.

**Register the domain.** Everything now points at **grillingbrush.com** —
the support address `hello@grillingbrush.com` appears in the footer, both
policy pages, the returns page and the shipping page. Check the domain is
actually available and register it before this copy goes live, otherwise the
site is publishing an email address you do not control. Handoff §"Product
name" listed fallbacks for the old brand; those are dead and you will need
new ones if `grillingbrush.com` is taken.

Carried over from handoff §7, none of which the build could resolve:

1. **Get the real manual for this unit.** The supplied PDF is for a HOMEFISH
   CB-303 keyboard brush — a different, non-electric product. Runtime, charge
   time and the ~1100 RPM figure are still unverified and are stated on the page.
2. **Replace the synthetic reviews and the aggregate rating.**
3. **Have a lawyer write the privacy policy and terms.** The versions in
   `policies/` are marked placeholder and describe current practice only.
4. **Confirm the fulfilment partner will genuinely ship DDP** on 1–2 day
   processing. The shipping page and refund policy both promise it.
5. **Turn on *Charge duties and import taxes at checkout*** in Settings →
   Markets. Without it the DDP promise is false at the till.
6. **Shoot real product photography.** Current images are AI renders. The proof
   video is supplier footage and needs a licence check.
7. **Check unit economics.** ~$29.50 landed against $67 with free US shipping
   and a 60-day no-return-required guarantee.
8. **Decide the worn-head path.** There is no replacement-head SKU; the page
   says email support, which is honest but an open support liability.
