# Kid Genius World Production Launch Checklist

Last updated: June 15, 2026

## Public Site

- [x] Firebase Hosting production deploy is active.
- [x] Custom domain live check passes for `https://kid-genius-world.com`.
- [x] `www` redirect, sitemap, blog links, images, and PWA assets are verified by `npm run qa:site-live`.
- [x] Installable web app assets are covered by browser QA.

## Child Learning Flow

- [x] Home world shows a first-screen school-day schedule.
- [x] Daily lessons rotate by date, grade, room, and round.
- [x] Classroom narration reads questions and answer choices directly.
- [x] Later school-day periods stay locked until the active lesson reaches the `6/6` mastery gate.
- [x] Progress saves into daily stats, unit practice counts, learning journal entries, and parent-visible proof.

## Parent Trust

- [x] Parent setup requires policy review and local PIN creation before child access.
- [x] Parent dashboard is protected by a grown-up check.
- [x] Privacy, terms, and parent support screens are visible.
- [x] Kid Genius World by CrateShip Studios branding appears on parent/trust surfaces.
- [x] Parent support email is published as `crateshipstudios@gmail.com`.

## Reports

- [x] Parent dashboard shows daily activity rows.
- [x] Parent dashboard shows weekly insight cards.
- [x] Parent dashboard shows monthly progress cards.
- [x] Teacher gradebook shows attempts, mastery status, evidence, reflections, and next action.

## Billing And Access

- [x] Firebase parent auth is wired.
- [x] Stripe checkout links are parent-only.
- [x] Owner comped access is supported for launch/admin testing.
- [ ] Run one final live checkout test with the agreed temporary live amount before advertising.
- [ ] Confirm Stripe branding, receipt email, cancellation portal, and webhook events one final time.

## Final Manual Checks Before Ads

- [ ] Sign in as a normal parent account, not owner comped.
- [ ] Confirm the 3-day trial starts correctly.
- [ ] Complete checkout and verify access unlocks.
- [ ] Cancel from Stripe portal and verify the app reflects billing status.
- [ ] Test on iPhone Safari install flow.
- [ ] Test on Android Chrome install flow.
- [ ] Ask one parent and one child to complete a school day without guidance.
