# Wonderlane delivery status

Published October 9, 2026 to https://wonderlane-tutor.koikes2021.workers.dev

Current Cloudflare Worker version: `7c3ee9a2-819f-46c4-94cc-0b94c3ec51ef`. Earlier delivery records below describe their own versions.

The deployed app is an independent free early-access learning build. Parent account creation, cloud progress sync, Stripe subscriptions and ElevenLabs narration remain disabled. Device-local progress and browser speech are available. No existing custom-domain DNS was changed.

## Verified

- Production build and TypeScript checks passed.
- Eleven curriculum/learning/audio tests passed, including 67,200 generator instances, story-sequence content, grade/session isolation, Grade 1 arithmetic ranges, example-word agreement, cancellation/completion and familiar-content flags. These are targeted regressions, not educator certification.
- Four Sites packaging compatibility tests passed.
- Hyperframes lint/inspect passed with zero errors and warnings.
- Local authentication, family isolation, progress validation, voice fallback and origin protection integration checks passed using disposable localhost test accounts.
- Source-to-rendered design QA passed for early access. Desktop, phone and tablet screenshots are in `output/qa`.
- Public home, JS, generated art, Hyperframes composition and API status returned HTTP 200 with the expected content types. Cross-origin API writes returned 403. Public voice endpoint accurately returned unavailable because no premium key is configured.
- Live Edge check passed: Hyperframes intro, Remotion playback, math practice, correct answer feedback and next-question transition, spelling tiles, Hear the word control and correct spelling feedback. No console errors or warnings were observed in the live check.
- Live API status: `accounts=false`, `billing=false`, `voice=false`.

HTTP evidence: `output/qa/public-http-checks.json`. Browser evidence: `output/qa/public-home.png`, `output/qa/public-reading.png`. Visual report: `design-qa.md`.

## Work before a paid launch

Follow the activation sequence in `README.md`: educator review and expanded standards/decodable coverage, family usability tests, verified parent consent and account recovery, final privacy/support/billing details, ElevenLabs pronunciation/timing checks, Stripe test-mode lifecycle and entitlement enforcement, Remotion licensing review, cross-device accessibility/performance checks and production monitoring/backup verification.

The implementation does not establish equivalence to a human tutor, certified full curriculum coverage or measured learning outcomes. Voice pronunciation and actual Stripe transactions were not verified without the relevant credentials. Oral fluency is not measured.

## First expansion published October 9

- 224 activity entries. Grade 1 has 60 math and 44 reading activities; addition/subtraction now has 40. Grade 2 and Grade 3 retain 30 per subject pending their expansions.
- Grade 1 reading has six areas, with six Sound Detective/listening tasks, four sentence/word-chain activities and four little books. Pattern and known-word metadata is supplied; isolated phoneme clips and educator review are still outstanding.
- Play starts browser narration and a Remotion example together. Spoken steps and captions match the example. Pause cancels old speech; resume repeats the current step. Replay and slower voice are available. No automatic voice on page load.
- Theo's arrow highlights Hear directions until activated. Next question returns to the top of the lesson on small screens. Written text remains available.
- Separate math/reading levels govern labels, launch, continuation and resume. Changing levels or learners invalidates an incompatible session. New learners start at Grade 1; earlier profiles retain their levels and progress.
- Story-order questions return valid first-sentence evidence. Repeated content inside a session is recorded as practice rather than a fresh independent check.
- Live Edge observed the speech-engine start event for the cub-to-cube example. Local Edge observed narration progression, pause, sentence tile construction, correct feedback, the direction cue disappearing and grade-switch navigation. Physical speaker output and cross-device voice quality were not directly measured.
- Visual checks: desktop, phone and tablet arrangements inspected. Edge page zoom affects the CSS width; requested 1440/390/768 viewports measured approximately 1600/433/853 CSS pixels. No horizontal overflow was found in the inspected phone/tablet flows. Temporary viewport overrides reset.
- Public HTTP confirms the new activity/narration bundle, home 200, JS 200 and voice unavailable/server flags still disabled. Evidence: `output/qa/expansion-public-checks.json`, `output/qa/public-narrated-example.png`, `output/qa/directions-mobile.png`, `output/qa/sentence-mobile.png`, `output/qa/narrated-example-tablet.png`.

At this first-expansion checkpoint, the larger 40–50-activities-per-section plan remained in progress. The full quantity expansion is now published as recorded below; educator/audio review and family pilots remain outstanding.

Final voice usability check: Sound Detective choices have separate speaker buttons. Live rapid replay gave no false voice error and submitted no answer. Cancelling one direction to hear another word is treated as intentional cancellation. Evidence: `output/qa/public-sound-detective-mobile.png`. The original public math and reading levels were restored to Grade 2 after checking Grade 1, without submitting curriculum answers.

## Original home restored October 9

The user rejected the animated 3D home experiment. The original Little Studio layout and illustrated blocks, book, lamp and Theo are restored. Curriculum and narration improvements remain intact. The experiment was never published. Typecheck and build passed; the restored main bundle is byte-for-byte identical to the current public bundle, with public home and JS responses both 200. Evidence: `output/qa/home-restored.png` and `output/qa/home-restored-checks.json`.

## Full section expansion published October 9

- 1,320 activity entries, adding 1,096 to the previous 224. All 33 grade/subject sections now have 40 activities. Each grade has five math sections (200 activities) and six reading sections (240 activities). Existing activity IDs and saved progress remain available. Random seeds are questions inside an activity, not additional activity counts.
- Added grade-specific math concept/task combinations, word study, spelling and sentence construction, listening, vocabulary, comprehension and read-along work. Thirty new original texts bring the passage bank to 78, plus four Grade 1 little books. Thirty new word banks support pattern and sentence activities. The inventory includes draft standards/pattern metadata; educator review is still pending.
- Preserved the approved illustrated home and Theo artwork. Expanded library badges and pagination expose each section's 40 activities. Phone reading answers use a single wider column.
- Spoken directions include the word or listening clue required to solve the task. After the child first activates Hear directions, later tasks in that lesson narrate automatically. Slower voice, Stop voice, separate choice speakers and Read together remain available. Supported reading choices do not earn independent credit; listening audio is normal task input.
- Fixed story tasks finish after one useful question and offer Next activity within the same grade/subject/section. Other activity lengths follow finite content diversity, up to ten questions. Fixed/repeated content and fluency stay practice evidence.
- Typecheck, 19 curriculum/learning/audio tests and four Sites packaging tests passed. The deterministic sweep covered 396,000 generated instances, with additional math-model, equation, grade-limit, tile, text-evidence, narration and practice-budget checks. Final production build passed; the existing large-chunk performance warning remains.
- Focused local Edge checks passed: new regrouping feedback, automatic next-task speech start, slower/stop controls, grade switch exiting an incompatible lesson, two-whole fraction number line, five-vote graph key/symbol quantities, Grade 1 sentence tiles and correct feedback, short-story completion and next activity, longer Grade 3 example and spoken choice without answer submission.
- Inspected desktop, phone and tablet arrangements. Temporary 390x844 and 768x1024 viewport requests measured about 433x937 and 853x1137 CSS pixels because of existing Edge zoom; inspected content widths did not exceed the viewport. Overrides were reset. No warnings/errors were observed in the focused final local/public browser checks. Physical speaker output, pronunciation quality and real-device behavior were not measured.
- Cloudflare deploy succeeded with version `d401d8d1-fa3e-4959-9dc3-fac78e75b083`. Public home, original artwork, main JS and status returned 200. Public JS content type is text/javascript and its SHA-256 matches the final local build. Live Edge confirmed Grade 2 math's 200 entries, reading's 240 entries, every section's 40 badge, 40-to-80 pagination and preserved earlier progress. No public curriculum answers or learner level changes were made.

Evidence: `output/qa/full-expansion-deploy.log`, `full-expansion-public-checks.json`, `full-expansion-public-home.png`, `full-expansion-public-library.png`, `expanded-math-voice.png`, `expanded-fractions-tablet.png`, `expanded-graph-desktop.png`, `expanded-sentence-phone.png`, `expanded-long-example-phone.png`, `expanded-reading-choice-phone.png` and `expansion-build.log`. Complete content inventory: `design/curriculum-inventory.json`.

Accounts, billing and ElevenLabs remain disabled (`accounts=false`, `billing=false`, `voice=false` on the API); browser speech and device-local learning work now. The quantity target is implemented. Educator review, controlled-decodable sequencing, pronunciation/timing review, placement/remediation refinements and child/parent pilots remain before paid release. This expansion is not proof of complete standards coverage or human-tutor equivalence.

## All-grade content audit and corrections, October 9

Reviewed all registered activity generators and the curated reading source material for Grades 1–3. Automated validation covers all 1,320 entries, with 27 passing tests and a 396,000-instance deterministic sweep plus independent semantic checks. Typecheck, final build and four Sites compatibility tests passed. This samples generated variations; it does not exhaust every random seed or substitute for elementary-educator approval.

Corrected adjective/adverb routing, related adverbs, ambiguous tense/conjunction prompts, dialogue commas, sentence-ending choices, syllable wording and a dialect-sensitive vowel match. Added explicit support for two story motivations and puddle evaporation, corrected a towel distractor, and selected 30 meaningful phrase models. Corrected counting endpoints, first-grade survey ranges, scaled-graph units, triangle assumptions, shape naming, equivalent-value expression distractors, fraction comparison context and a Theo-versus-Theo story. Grade 3 volume now uses liters in line with the referenced standard. Area mats show unit squares; perimeter geometry follows the stated dimensions; simple perimeter mats have valid descriptions; model labels no longer contain accidental commas.

New saved attempts include content identity. Repeat attempts across sessions remain practice, duplicate checks cannot manufacture mastery, and Retained requires a later set of at least four fresh unassisted checks at 80% accuracy, at least 24 hours after older successful evidence. Old attempts remain saved; their content cannot be fully reconstructed retroactively from legacy IDs.

Independent language reference: 398 target words checked (397 matched CMU entries; lunchbox is a separately documented compound), 5,400 generated syllable checks and 5,100 generated sound-match checks, with no unresolved findings. CMU data and tests do not establish browser/ElevenLabs pronunciation quality or grade-level reading difficulty.

Edge confirmed all six grade/subject catalogs with all 33 sections at 40. Representative successful local answer flows covered Grade 1 composition and vowel matching; Grade 2 adjective/adverb pairs and an offset ruler (20 minus 2 equals 18); Grade 3 unit-square area (5 times 2 equals 10), proportional perimeter (3 plus 11 plus 3 plus 11 equals 28), simple mats and statement dialogue punctuation. Narration start/progression was observed. Inspected phone and tablet widths had no horizontal overflow; existing Edge zoom gives about 433 and 853 CSS pixels for requested 390 and 768 widths. Overrides were reset. No local/public console errors or warnings were observed in the final inspected flows. Physical audio and real-device performance remain unverified.

Published to the existing Cloudflare Worker as `7c3ee9a2-819f-46c4-94cc-0b94c3ec51ef`. Public home/JS/status returned 200, the public JS SHA-256 matches the final build, and service flags remain disabled. Public Edge confirmed the approved home, saved Grade 2 levels and a 40-row language section without changing learner levels or submitting public answers.

Audit and ten recommendations: `design/all-grades-content-audit.json`. Evidence: `output/qa/content-audit-tests.log`, `language-audit.json`, `all-grades-browser-counts.json`, `all-grades-audit-build.log`, `all-grades-audit-deploy.log`, `all-grades-audit-public-checks.json`, `all-grades-audit-public.png`, `audit-grade1-reading.png`, `audit-grade2-reading.png`, `audit-grade2-math-phone.png`, `audit-grade3-area.png`, `audit-grade3-perimeter.png`, `audit-grade3-reading-tablet.png`.

Remaining learning gaps are recorded explicitly in the audit: standards coverage and educator signoff, controlled-decodable sequencing, larger fresh assessment banks, concept-specific remediation, hands-on game depth, validated read-aloud practice and family/device trials. No claim is made that every possible question or grade placement is certified correct.

## Spanish release, October 10

English/Español now selects the full studio, native Spanish reading curriculum and browser voice guidance for Grades 1–3. Each language has 1,320 activities: 600 shared math activities and 720 reading activities. Spanish includes six reading sections of forty per grade, 24 native books and 60 writing prompts. The selected locale also follows parent authentication, Stripe checkout/portal and the narrated tour. Existing publisher articles and the labeled /legacy app remain English.

Validation: 55 tests, typecheck and production build; four Sites compatibility checks; 198,000 generated Spanish-mode questions, with no invalid answer sets or untranslated English math prompts, teaching text, objectives or titles. Finite banks and learner-wide question history prevent recycling exhausted questions. Spanish voice availability depends on the device; captions and written instructions remain. Native Spanish word/phonics fixtures are independently checked, but these results do not certify an entire school curriculum or a Google Play release. Paid Firebase membership is enabled on the primary site; old Cloudflare API account flags do not describe the primary Firebase/Stripe membership.
