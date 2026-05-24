# Kid Genius World Production Finish Line

This web app stays in `C:\Users\koike\Downloads\kidsgenuisworld` and the GitHub repo `jamaine1984/kidsgenuisworld`.

## Web App Finish Order

1. Finish non-payment product quality first: curriculum, teacher-led rooms, parent trust, static media, PWA install, legal pages, and browser QA.
2. Keep Stripe as the final production gate. Do not block content, media, or mobile planning on live checkout testing.
3. Run the full web launch gate:

```bash
npm run qa:all
npm run qa:production-live
```

4. Run the static media gate whenever stories, covers, or voice files change:

```bash
npm run qa:media
```

## Final Stripe Gate

Stripe checkout is already parent-only and Firebase Functions-backed. The final paid-launch test should happen after the web app is otherwise complete.

Use a temporary low-price Stripe checkout to verify:

- Checkout opens from the parent dashboard.
- The signed webhook records the checkout session and subscription.
- Trial/subscription access unlocks only after server verification.
- The parent dashboard shows Stripe event and invoice status.
- Billing portal opens for the same Firebase parent account.

Do not use a one-cent USD charge unless Stripe explicitly allows it in the Dashboard. Stripe's current USD minimum non-zero charge is `$0.50`, so `$0.50` is the safer temporary live checkout amount.

After the test, restore the production `$4.99` and `$9.99` monthly Price IDs in Firebase Functions environment config.

## Mobile App Separation

Start mobile only after the web launch gates pass and Stripe is confirmed.

Use a separate local folder:

```text
C:\Users\koike\Downloads\Kid Genius World Mobile
```

Use a separate GitHub repo, for example:

```text
jamaine1984/kid-genius-world-mobile
```

The mobile repo should not reuse the web repo folder. It can share product decisions, curriculum data, static media, Firebase project settings, and brand assets, but commits, dependencies, native build files, and store release work should stay separate.

Before creating the mobile app, read `docs/mobile-handoff.md`. The current web repo has a legacy tracked `ios/` folder from earlier work; treat it as reference only and do not extend it for the Play Store path.

## Non-Stripe Launch Checklist

- `npm run qa:media` passes.
- `npm run qa:all` passes.
- `npm run qa:production-live` passes after Firebase Hosting deploy.
- PWA install works on iPhone and Android.
- Voice narration uses saved static media only.
- Story covers load from saved static files with fallbacks.
- Parent privacy, support, terms, and data controls are visible.
- No local secrets are tracked by Git.
- Search Console sitemap remains submitted and live.
