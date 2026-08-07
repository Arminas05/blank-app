# Metafields

Shop-level metafields, namespace `cinder`. The theme reads these; section blocks
are only a fallback so the store is not blank before you set them.

Create each one in **Settings → Custom data → Shop**, then paste the file
contents into the value field.

| Definition            | Type                      | File                  |
| --------------------- | ------------------------- | --------------------- |
| `cinder.spec_rows`    | JSON                      | `spec_rows.json`      |
| `cinder.faq`          | JSON                      | `faq.json`            |
| `cinder.grate_compat` | JSON                      | `grate_compat.json`   |
| `cinder.box_contents` | JSON                      | `box_contents.json`   |
| `cinder.safety_warning` | Rich text (multi-line)  | `safety_warning.html` |

Why shop-level rather than product-level: the spec table, the FAQ and the
compatibility table all appear on more than one page (home, PDP, and their own
pages). One source means they cannot drift apart — the reason the handoff §1
asked for metafields in the first place.

## Shapes the theme expects

- `spec_rows` — `[{ "k": string, "v": string }]`
- `faq` — `[{ "q": string, "a": string }]`
- `grate_compat` — `[{ "surface": string, "verdict": string, "note": string }]`
- `box_contents` — `[string]`
- `safety_warning` — rich text, rendered with `metafield_tag`

If a metafield is absent or the wrong shape, the section silently falls back to
its blocks. Nothing 500s, but the content will be the theme default rather than
yours — worth checking each page after you set them.
