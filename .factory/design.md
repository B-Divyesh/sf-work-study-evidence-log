# Practice Evidence Log — visual thesis

## Direction: glacial minimal ceramics

Practice rarely transfers in a straight line. It accumulates like translucent glaze on a hand-thrown vessel: quiet layers that only become legible when light crosses them. The interface therefore feels like an orderly ceramic workbench in cold morning light—warm enough to be human, sparse enough to leave the learner's evidence in control. It deliberately avoids dashboard tropes, gamified counters, corporate blue, and generic gradient heroes.

Clarity is carried by a single cobalt action, large handwriting-like prompts, and a chronological seam linking practice to application. Deference comes from broad negative space and very little persistent chrome. Depth comes from matte paper/porcelain surfaces, fine mineral borders, and a restrained lift when a sheet opens.

## Palette

All colors are encoded as CSS custom properties. Contrast targets were checked against the paired surfaces and remain at least 4.5:1 for text.

| Token | Day kiln | Night kiln | Purpose |
| --- | --- | --- | --- |
| `--ground` | `#f2f5f2` glacier milk | `#111918` kiln shadow | page background |
| `--surface` | `#fbfcf7` porcelain | `#182321` black clay | primary sheets |
| `--surface-2` | `#e7eeeb` frosted celadon | `#21302d` deep celadon | recessed areas |
| `--ink` | `#172623` iron ink | `#eef5ef` frost | primary text |
| `--muted` | `#52645f` river stone | `#aebfba` pale stone | secondary text |
| `--line` | `#bdcbc6` glaze edge | `#475a55` wet slate | borders and rules |
| `--cobalt` | `#165d6d` deep blue glaze | `#78c3cf` ice glaze | action/focus |
| `--cobalt-ink` | `#ffffff` | `#0c2427` | accent contrast |
| `--lichen` | `#397052` | `#83c69e` | linked/application state |
| `--ember` | `#8a492f` | `#efa47e` | warning/destructive |

The default follows system appearance. A labelled theme control offers light, dark, or automatic treatment; both preserve the same material hierarchy.

## Type

No fonts are fetched at runtime. Headings and retrieval prompts use Georgia (`Georgia, 'Times New Roman', serif`) for the measured, annotated character of a field notebook. Interface copy and data use the modern native sans stack (`ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`) for speed and legibility. Tabular figures are enabled for dates and minutes.

Scale: 14px detail, 16–18px body, 21px section, 30–48px display. Body leading is 1.55; reading width tops out near 68 characters.

## Spacing and shape

The base rhythm is 4px with working intervals of 8, 12, 16, 24, 32, 48, and 72px. The desktop canvas is at most 1180px; working text is narrower. Corners are softly imperfect in spirit but deterministic in code: 8px for inputs, 14px for sheets, and a single asymmetrical 28px corner on the hero vessel. Shadows are diffuse and low contrast, like an object sitting on chalky stone. Touch targets are at least 44px.

At 390px, navigation labels remain visible, the hero artwork becomes a shallow header object, and the evidence list becomes a single continuous stack. No essential action moves behind hover or a fixed bar.

## Interaction grammar

- “Log practice” is the one filled action. Secondary actions are outlined or textual.
- A session is a porcelain slip. Its retrieval prompt is the largest content inside it; metadata recedes.
- An application note appears as a green mineral seam below the practice slip, visually connecting input to later evidence without awarding points.
- Forms open in native accessible dialogs from the action that summoned them and return focus on close.
- Destructive deletion names the session and requires confirmation. Save, import, offline, and update outcomes are announced in a polite live region.
- Empty and error states always give one next action. Offline is a normal local-working state, not an alarm.

## Motion policy

Transitions last 160–240ms and use only opacity and transform. Dialog sheets rise 8px from their trigger's visual plane; newly linked application notes settle into place once. No decoration loops. Under `prefers-reduced-motion: reduce`, animations and smooth scrolling are disabled and all state changes become instant while layer/contrast hierarchy remains.

## Asset plan and prompt sheet

One original still-life hero anchors the product world. It is explanatory: two ceramic forms joined by a cobalt glaze seam represent practice becoming useful evidence. Small interface icons are hand-authored SVG paths or typographic marks; there are no icon libraries or stock assets.

**Use case:** `stylized-concept`  
**Asset:** wide landing/workspace hero illustration  
**Subject:** two simple hand-built porcelain forms—one low study tile with a single indented line, one upright vessel fragment—connected by a thin cobalt-blue glazed channel  
**World/materials:** pale glacial stone work surface, matte ivory porcelain, subtly irregular hand-thrown edges, hairline celadon crazing, one deep cobalt glaze seam  
**Light/lens:** quiet overcast arctic morning, soft long shadows, editorial still-life, slightly elevated 50mm view, generous negative space  
**Palette words:** glacier milk, iron ink, frosted celadon, deep cobalt, trace lichen  
**Negative list:** people, hands, devices, screens, text, letters, numbers, logos, watermark, gradients, bright saturated colors, extra objects, glossy plastic, corporate stock-photo styling

Final generation prompt:

> Use case: stylized-concept. Asset type: wide web hero illustration. A quiet editorial still life on pale glacial stone: two simple hand-built ivory porcelain forms, one low study tile with a single abstract indented groove and one upright vessel fragment, connected by a thin deep-cobalt glazed channel that visibly runs from one object to the other. Matte ceramic, subtly irregular handmade edges, delicate celadon crazing, sparse mineral dust. Slightly elevated 50mm view, overcast arctic morning light, soft long shadows, generous calm negative space, sophisticated museum-catalog composition. Palette of glacier milk, iron ink, frosted celadon, deep cobalt, tiny trace of lichen. No people, hands, devices, screens, text, letters, numbers, logos, watermark, gradients, bright saturated colors, extra objects, glossy plastic, or stock-photo styling.

## Provenance

The hero is generated specifically for this product with the factory Azure image deployment (`factory-image`) on 2026-08-28 using `/opt/fleet/lib/gen-image.sh`; the exact prompt appears above and in the asset sidecar. It is original, contains no people, brands, or copyrighted characters, and is disclosed as generated in the footer. The selected raster is reviewed for text artifacts, unintended symbols, edge seams, and palette fit before inclusion. WebP/AVIF derivatives are produced locally; the source PNG and JSON prompt remain in `assets/src/`.
