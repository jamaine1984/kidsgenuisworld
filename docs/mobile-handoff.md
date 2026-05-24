# Kid Genius World Mobile Handoff

This file is the boundary between the production web app and the future store app.

## Repository Boundary

The current repo is the web app:

```text
C:\Users\koike\Downloads\kidsgenuisworld
github.com/jamaine1984/kidsgenuisworld
```

The future mobile app must start in a separate folder:

```text
C:\Users\koike\Downloads\Kid Genius World Mobile
```

Use a separate GitHub repo for mobile:

```text
github.com/jamaine1984/kid-genius-world-mobile
```

Do not add Expo, React Native, Capacitor, Android Gradle, or new Xcode work to the web repo. The mobile repo can reuse product decisions, brand assets, curriculum shape, Firebase project settings, story-cover files, and saved voice-media strategy.

## Legacy Native Reference

This web repo currently contains a tracked `ios/` folder from earlier native-wrapper work. Treat it as legacy reference only. Do not extend it for the Play Store build. When mobile work starts, copy only the useful ideas into `C:\Users\koike\Downloads\Kid Genius World Mobile`, then keep future native work in the mobile repo.

## Mobile Reuse Inventory

Reuse these web assets and decisions in the mobile app:

- Brand name: `Kid Genius World`
- Studio brand: `CrateShip Studios`
- Web domain: `https://kid-genius-world.com`
- Firebase project: `kid-genius-world`
- Android package name already reserved in Firebase: `com.kidgenius.world`
- Selected logo: `public/brand/logo-option-1-genius-globe.svg`
- App icons: `public/icons/`
- Story covers: `public/story-covers/`
- Saved voice manifest: `public/voice-cache/manifest.json`
- Curriculum model: `services/curriculum.ts`
- Teacher-led school model: `services/schoolMode.ts`
- Parent trust/legal copy: `components/LegalInfo.tsx`

## Mobile Build Direction

Start with Android/Play Store first because the user specifically wants the Play Store path.

Recommended order:

1. Create the separate mobile folder and GitHub repo.
2. Choose the mobile stack.
3. Reuse Firebase Auth, Firestore rules, Stripe Functions, static story covers, and saved voice strategy.
4. Port the parent gate, child profiles, school-day plan, room lessons, story reader, game arcade, and parent dashboard in stages.
5. Add Play Store assets, privacy policy links, Data safety answers, and closed testing.
6. Only then consider iOS/App Store work.

## Before Mobile Starts

- Web app full QA passes.
- Static media QA passes.
- Live domain QA passes.
- Final Stripe low-price checkout test passes.
- Mobile repo and folder are created separately.
- No new native dependencies are added to the web repo.
