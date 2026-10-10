# Wonderlane design QA

October 9, 2026. Visual acceptance for the current early-access build; this is not a paid-launch, curriculum-effectiveness or full accessibility certification.

## Comparison targets and normalization

- Home source: `design/selected-home.png` (1487 × 1058 pixels), with `design/little-studio-reference.png` as the selected art-direction reference.
- Class source: `design/maker-lab-reference.png` (1586 × 992 pixels).
- Implementation: compiled Cloudflare Worker app at `http://localhost:8789`, viewed in Microsoft Edge. Desktop CSS viewport 1440 × 1024; mobile 390 × 844; tablet 768 × 1024. `devicePixelRatio` observed as 1.
- Browser screenshot exports for scrolling desktop/mobile pages measured 1425 × 1013 and 375 × 812; the exporter scales its page image around the scrollbar. Comparison copies normalize these to the requested CSS viewport. The original source and original captures are preserved. Tablet capture is 768 × 1024. Comparisons exclude browser chrome.
- Home source is normalized to 1440 × 1024 with negligible aspect-ratio adjustment; classroom board is contained in a 1440 × 1024 cream canvas. This two-subject concept board and the implemented one-subject lesson differ intentionally in content and state. Classroom comparison evaluates the material, tutor, text, block labels and controls rather than claiming a pixel clone of both panels.
- Home source uses grade 2 and a sample continuation; captured home has grade 1 and real saved practice. Both represent the same home state. Topic titles, quantities and progress are dynamic.

## Full and focused evidence

- `output/qa/home-comparison-before.png`: source and initial home in one image.
- `output/qa/home-comparison-final.png`: source and revised home in one image.
- `output/qa/home-heading-comparison.png`: focused source/implementation typography comparison.
- `output/qa/maker-comparison-final.png`: classroom board and actual place-value lesson together.
- `output/qa/maker-label-comparison.png`: source tens and implemented labelled hundreds/tens in a focused comparison.
- `output/qa/mobile-camera-comparison.png`: mobile cropping before the fix and complete model after it. Quantities differ because a fresh lesson was started; the same component, viewport and question type are compared.
- `output/qa/home-final.png`, `home-mobile-final.png`, `home-tablet-final.png`, `blocks-final.png`, `lesson-mobile-final.png`, `demo-final.png`, `spelling-desktop.png`, `spelling-mobile.png`, `parents-desktop.png`: browser-rendered states. Final mobile lesson shows 923 with nine hundreds, two tens and three separate ones.

The combined images were opened and visually inspected. Focused regions were needed to assess rounded type, instruction legibility, numerical labels and the small-screen work mat.

## Comparison history and resolved findings

1. **P2 — Home scale and hierarchy.** Initial heading, subject art and bear were too small relative to the selected home; the hero felt sparse. Evidence: `home-comparison-before.png`. Increased display type and art, widened subject surfaces and repositioned Theo. Revised evidence: `home-comparison-final.png` and `home-heading-comparison.png`. Resolved.
2. **P2 — Mobile tutor and controls.** Initial mobile home hid the mascot, and the lesson step strip required awkward horizontal scrolling. Added a compact Theo introduction above the activities, explicit navigation labels and a four-column step strip. Evidence: `home-mobile-final.png` and `lesson-mobile-final.png`. Resolved.
3. **P1 — Work-mat lifecycle failure.** HTML overlays inside the 3D scene produced unmount errors when advancing between questions. Replaced numeric overlays with disposable canvas-texture sprites. A full compiled ten-question lesson completed without console errors. This was a runtime blocker found during interaction QA, recorded separately from visual fidelity. Resolved.
4. **P2 — Small-screen quantity cropping and labels.** Fixed zoom cut off hundreds/tens on mobile. Camera fit now responds to viewport dimensions and model extent; labels use larger raster text. Evidence: `mobile-camera-comparison.png` and final `lesson-mobile-final.png`. Numeric blocks remain fully visible. Resolved.
5. **P2 — Ones overlapping a hundred block.** The nine-hundred arrangement left the ones at the edge of the third row. Moved ones to a separate row below the hundreds and widened fitting for two large operands. Evidence: final `lesson-mobile-final.png` and `blocks-final.png`. Resolved.
6. **P2 — Tablet continuation obscured tutor bubble.** At 768 pixels Theo's bubble appeared behind the continuation strip. Anchored the tablet tutor beside the subject art. Before: `home-tablet.png`; after: `home-tablet-final.png`. Resolved.

## Required fidelity surfaces

- **Fonts and typography:** self-hosted Nunito 800/900 for rounded display headings and Nunito Sans for upright readable body text. Source image font is inferred from appearance. Display scale, line height and paragraph wrapping were inspected in the focused comparison. Prompt text remains unobstructed. Mobile headings wrap naturally and retain hierarchy.
- **Spacing and layout rhythm:** home uses two subject areas, a right-side desktop tutor and a wide continuation surface. Cream workspace and oak border group one activity. Desktop, tablet and phone captures show clear boundaries and operable controls. Phone naturally scrolls to later controls; no horizontal page overflow was observed (`scrollWidth=375`, `innerWidth=390`).
- **Colors and tokens:** cream `#fff9ef`, deep blue `#132756`, cobalt `#294ee8`, terracotta `#ca6044` and gold `#f0ba40`. Light instructional surfaces maintain strong dark text. Supported and successful feedback are distinct through text as well as color. Color consistency was checked against the source board.
- **Image quality and asset fidelity:** actual generated raster artwork supplies the studio, number blocks, pop-up book and transparent bear. Subject, apron/sun emblem, warm light and wood materials match the selected direction. WebP crops are sharp and have no visible transparency halo. The same bear asset is used on home, lessons, completion, Hyperframes and Remotion. Educational quantities use genuine 3D geometry rather than baked-in decorative answers.
- **Copy and content:** Math Studio, Reading Room, greeting, tutor invitation and continuation follow the home concept. Real lesson prompts and feedback replace the concept's sample answers. App copy avoids unsupported superiority or human-tutor equivalence claims. Parent view states device-local saving and free early access accurately; account/payment controls remain unavailable with current flags.
- **Icons and affordances:** consistent rounded Phosphor icons, labelled controls, visible focus styles, real buttons/selects and large answer tiles. Standard sun brand icon is an intentional library icon variant of the source mark. No custom SVG illustrations or CSS mascot substitutes were used.

## Interactions and console checks

Browser tested: subject selection, grade changes, catalogue search and domains, Hyperframes arrival/skip, Remotion playback/end frame and practice transition, ten-frame add/remove/check, base-ten lessons through all ten questions, incorrect answer/hint/retry, spelling tiles, progress persistence/reload, pause/resume, parent gate and progress, separate subject levels, mobile navigation and answer layouts. Final compiled 3D flows had zero observed console errors. An earlier Remotion license notice belonged to a previous build; the current Player acknowledges the reviewed license notice.

Build and type checking passed. Curriculum/model tests checked 54,000 generated question instances; all three tests passed. Four Sites compatibility checks passed. Hyperframes lint and inspect returned zero errors/warnings. Local service integration checks passed for disposable accounts and isolated progress. These checks do not establish real-child usability or learning efficacy.

## Expected differences and remaining scope

- One subject and one problem per class replaces the concept board's simultaneous math/reading panels. This is intentional to keep task focus.
- Asset poses and background composition vary from the mock while retaining the selected bear and materials. Standard sun icon replaces the concept's alternate logo mark. These are accepted art-direction variants, not claims of pixel identity.
- Four lesson stages combine the board's tutor demo/build/practice sequence; scheduled retrieval appears through recommendations and later-day reviews.
- P3 follow-up: refine tablet background placement so Theo's feet align with the wooden surface rather than the background lamp. It does not obscure an activity or control.
- Real-device Safari, low-powered tablets, screen-reader testing, child/parent trials, educator review, premium narration and paid billing remain release work. The current report passes visual acceptance for early access only.

## Implementation checklist

- [x] Compare source and browser implementation in combined full and focused views.
- [x] Resolve heading/art scale, tutor continuity, mobile stages and tablet overlap.
- [x] Resolve 3D lifecycle, clipping, numeric labels and block overlap.
- [x] Verify compiled math, reading and parent interactions.
- [x] Preserve honest early-access status and inactive external-service controls.
- [ ] Complete the separate paid-launch sequence in `README.md`.

final result: passed

## Public verification

After deployment, Edge opened `https://wonderlane-tutor.koikes2021.workers.dev`. Live intro, Remotion playback, 3D math answer/next-question flow, spelling tiles and correct feedback passed with zero observed console errors or warnings. `output/qa/public-home.png` and `public-reading.png` record the published build. Public HTTP/API evidence is in `output/qa/public-http-checks.json`. This adds deployment evidence without changing the early-access acceptance scope above.


## October 9 first expansion: focused verification

Little Studio/Maker Lab and the same Theo artwork remain. The changed teaching controls, captions, silent-e tiles and direction cue were visually inspected at desktop, phone and tablet arrangements. Captions are visible while audio is paused; the silent-e example highlights the actual vowel and mutes the final e. Sentence word tiles wrap on phones, and the controls have approximately 44px minimum heights. No horizontal overflow was found in the inspected phone/tablet DOM geometry. Requested viewport sizes are affected by existing Edge zoom (approximately 1600, 433 and 853 CSS pixels). Temporary overrides were reset. Screenshot capture initially stalled and recovered after bringing the preview to the foreground.

Flow evidence: 40 Grade 1 addition rows reachable; reading grade switch exits Grade 2 lesson and displays Grade 1's 44 activities/six areas; Hear directions dismisses the cue; sentence tiles construct The pig can dig. and give correct feedback; next returns to the top; narration progresses and pauses; live speech start event observed for cub to cube. No console warnings/errors observed in the inspected flows. This is focused UI verification, not real-device or educator validation. Premium server voice still unavailable.

Screenshots: output/qa/public-narrated-example.png, directions-mobile.png, sentence-mobile.png, narrated-example-tablet.png, narrated-example-desktop.png.

Final compiled/public check: each listening choice has a separate 48px speaker control. Rapidly hearing directions then choices does not submit an answer or show a false error. Mobile screenshot: `output/qa/public-sound-detective-mobile.png`.

## October 9 full expansion: focused verification

The illustrated Little Studio home remains the approved UI. Published library totals are 200 math and 240 reading per grade; all five math and six reading area badges show 40. Live pagination reveals 80 rows after Explore 40 more. Previous Independent math and Practicing reading evidence remains visible.

New task QA covered Grade 2 regrouping with a base-ten mat and correct equation feedback, automatic directions on the next question after first activation, Grade 3 fractions past one on a 0–2 number line, and a five-vote picture graph with matching symbol quantities. Grade 1 sentence dictation tiles construct The bag has a map. and return correct feedback. A fixed comprehension task completes after 1/1, then Next activity remains in Grade 1 reading and the same area. Grade switches exit incompatible lessons. A longer Grade 3 example shows chunked narration/captions; choice audio leaves all answers unsubmitted and displays supported-work help.

Phone/tablet requested viewports were 390x844 and 768x1024, about 433x937 and 853x1137 CSS pixels at existing browser zoom. Inspected content had no horizontal overflow. Reading choices were widened to one column on phones after the long-answer inspection. Temporary viewport override was reset. No final local/public console errors or warnings were observed. These are focused browser checks, not physical speaker, pronunciation, assistive-technology, educator or real-device validation.

Published screenshots: `output/qa/full-expansion-public-home.png` and `full-expansion-public-library.png`. Task screenshots: `expanded-math-voice.png`, `expanded-fractions-tablet.png`, `expanded-graph-desktop.png`, `expanded-sentence-phone.png`, `expanded-long-example-phone.png`, `expanded-reading-choice-phone.png`. Public bundle/API evidence: `output/qa/full-expansion-public-checks.json`.

## October 9 all-grade content audit: browser verification

All six grade/subject libraries were read in Edge; each math grade has 200 activities/five areas and each reading grade has 240 activities/six areas, with 40 in every area. Successful local answers verified Grade 1 vowel matching/composition, Grade 2 adjective/adverb pairs/offset-ruler subtraction, and Grade 3 square-unit area/perimeter/dialogue punctuation. The simple perimeter mat describes the rectangle without undefined values. Final rendered perimeter labels read 3 units and 11 units and the model preserves their ratio. Phone measurement and tablet punctuation flows did not overflow. Narration startup was observed, with no final console warnings/errors. Temporary viewport overrides were reset.

The public bundle matches the tested build. Live public UI preserves the approved home and previous learner levels, and the language area renders 40 rows. No public answers or level changes were submitted. Screenshots and evidence are listed in BUILD_STATUS.md. The content review has separate limitations and ten recommendations in `design/all-grades-content-audit.json`; this browser evidence is not educator certification or real-child learning validation.
