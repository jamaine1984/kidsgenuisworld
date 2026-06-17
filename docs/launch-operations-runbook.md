# Kid Genius World Launch Operations Runbook

This runbook is for running the production web app after the product, media, and browser QA gates pass.

## Daily Launch Checks

Run these before and after meaningful production changes:

```bash
npm run qa:all
npm run qa:production-live
```

Check these live URLs:

- `https://kid-genius-world.com`
- `https://www.kid-genius-world.com`
- `https://kid-genius-world.com/manifest.webmanifest`
- `https://kid-genius-world.com/sitemap.xml`
- `https://kid-genius-world.com/blog/`

The live QA script already checks homepage, `www` redirect, PWA assets, sitemap, blog links, static images, protected billing routes, unsigned webhook rejection, and CORS preflight.

## Support Operations

Current parent support contact:

```text
crateshipstudios@gmail.com
```

Support requests to track:

- Parent sign-in trouble.
- Parent PIN reset or profile questions.
- Subscription, trial, receipt, cancellation, or Stripe billing portal questions.
- Privacy requests: review, export, correction, deletion, or turning off cloud sync.
- Accessibility setting questions.
- Voice or story-cover media not loading.
- Child progress sync questions.

Support response rule: never ask a child for personal information. Work only with the parent or guardian account holder.

## Firebase Monitoring

Check Firebase Console after deploys:

- Hosting release completed for `kid-genius-world`.
- Functions logs show no repeated `billingCheckout`, `billingAccess`, `billingPortal`, or `billingWebhook` errors.
- Authentication user creation looks parent-only.
- Firestore rules are deployed and `billingCustomers` remains server-only.
- Firestore data only appears for parent-approved sync.

Rollback path:

1. Open Firebase Hosting release history.
2. Roll back to the previous known-good release.
3. Run `npm run qa:production-live`.
4. Open a GitHub issue or local task with the failing commit and symptom.

## Stripe Monitoring

Stripe remains the final launch gate.

Firebase Functions must be running before any paid checkout test. If `npm run qa:billing-live` reports that a function is unavailable or that billing is disabled, upgrade the Firebase project to Blaze, deploy functions with `npm run firebase:deploy:functions`, then rerun `npm run qa:billing-live`. Firebase Hosting alone can serve the app, but Stripe checkout, billing portal, billing access, and webhooks depend on Firebase Functions.

After the low-price live checkout test:

- Stripe Dashboard shows the checkout session.
- The webhook endpoint receives signed events.
- Firestore stores the billing snapshot under the parent account.
- Parent Dashboard shows `Stripe webhook:` and `Latest invoice:` status.
- Billing Portal opens for the same Firebase parent account.

Use Stripe Dashboard logs to compare request IDs and webhook events when debugging.

## Search And SEO Monitoring

Google Search Console account:

```text
KOIKES2021@gmail.com
```

Weekly checks:

- Sitemap remains submitted: `https://kid-genius-world.com/sitemap.xml`
- Pages are indexed without unexpected exclusions.
- Blog URLs return 200.
- Search Console does not report mobile usability or page indexing errors.
- Update blog content gradually instead of bulk low-quality posts.

## Static Media Monitoring

Run after story, cover, or voice work:

```bash
npm run qa:media
```

Current media expectations:

- Every story has a saved PNG cover and SVG fallback.
- Static voice manifest is present.
- Voice files are saved media, not live child-facing generation.
- Parent privacy controls can turn saved narration off.

If voice is missing for a new line, generate it offline, export static media, upload voice files to the media host, then redeploy.

## Mobile Boundary

Do not add new native work to this web repo. Before mobile starts:

```bash
npm run qa:mobile-handoff
```

Use:

```text
C:\Users\koike\Downloads\Kid Genius World Mobile
github.com/jamaine1984/kid-genius-world-mobile
```

The tracked `ios/` folder in this web repo is legacy reference only.

## Incident Checklist

For production issues:

1. Confirm whether it reproduces locally.
2. Run `npm run qa:all`.
3. Run `npm run qa:production-live`.
4. Check Firebase Hosting and Functions logs.
5. Check Stripe webhook logs if billing is involved.
6. Check Search Console only for indexing/SEO issues, not runtime bugs.
7. Roll back Firebase Hosting if the issue affects child access, parent controls, checkout, legal pages, or installability.
