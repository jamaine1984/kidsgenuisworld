# Kid Genius World - iOS Build Instructions

## Prerequisites

1. **Xcode 15.0+** installed
2. **Apple Developer Account** (for TestFlight/App Store)
3. **Node.js** (for building web assets)

---

## Step 1: Build Web Assets

From the project root:

```bash
cd /Users/jamainemartin/kid-genius-world
npm install
npm run build
```

Copy to iOS bundle:

```bash
cp -r dist/* ios/KidGeniusWorld/WebContent/
```

---

## Step 2: Open in Xcode

```bash
open ios/KidGeniusWorld.xcodeproj
```

---

## Step 3: Configure Signing

1. Select the **KidGeniusWorld** target
2. Go to **Signing & Capabilities**
3. Select your **Team**
4. Xcode will automatically create provisioning profile

---

## Step 4: Add App Icon

1. Open `Assets.xcassets`
2. Click on `AppIcon`
3. Drag a **1024x1024** PNG icon into the slot

**Icon Design Tips for Kids Apps:**
- Bright, friendly colors
- Simple, recognizable imagery
- No text (hard to read at small sizes)
- Character face or mascot works well

---

## Step 5: Test on Simulator

1. Select a simulator (iPhone 15, iPad, etc.)
2. Press **Cmd + R** to build and run
3. Verify:
   - App launches without crash
   - All rooms work
   - Parent gate appears for links
   - Speech works

---

## Step 6: Test on Device

1. Connect your iPhone/iPad
2. Select device as target
3. Press **Cmd + R**
4. Trust developer on device if prompted

---

## Step 7: Archive for Distribution

1. Select **Any iOS Device** as target
2. **Product** → **Archive**
3. Wait for archive to complete
4. **Distribute App** → **App Store Connect**
5. Upload

---

## Step 8: App Store Connect Setup

### Create App Listing

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. **My Apps** → **+** → **New App**
3. Fill in:
   - Platform: iOS
   - Name: Kid Genius World
   - Primary Language: English
   - Bundle ID: com.kidgeniusworld.app
   - SKU: kidgeniusworld001

### Configure for Kids

1. **App Information** → **Category**
   - Primary: Kids
   - Secondary: Education
   - Age Rating: Configure for 4+

2. **App Privacy**
   - Select: "No, we do not collect data from this app"

3. **Age Rating**
   - Answer all questions "None" or "No"
   - Result: 4+

### Screenshots Required

- 6.7" iPhone (1290 x 2796)
- 6.5" iPhone (1284 x 2778)
- 5.5" iPhone (1242 x 2208)
- 12.9" iPad (2048 x 2732)

---

## Step 9: TestFlight

1. Go to **TestFlight** tab in App Store Connect
2. Select your uploaded build
3. Add test information
4. Submit for Beta App Review (if external testers)
5. Once approved, invite testers

---

## Step 10: Submit for Review

1. Complete all App Store listing fields
2. Add screenshots
3. Add privacy policy URL
4. Select build
5. Answer export compliance: "No" (no encryption)
6. Submit for Review

---

## Troubleshooting

### "WebContent not found"

Ensure web assets are in `ios/KidGeniusWorld/WebContent/`:
```bash
ls ios/KidGeniusWorld/WebContent/
# Should show: index.html, assets/
```

### Signing Issues

- Make sure you selected a valid Team
- Check that provisioning profile was created
- Try: Xcode → Preferences → Accounts → Download Manual Profiles

### Build Fails

Clean and rebuild:
1. **Product** → **Clean Build Folder** (Cmd + Shift + K)
2. **Product** → **Build** (Cmd + B)

---

## Quick Reference

| Command | Purpose |
|---------|---------|
| `npm run build` | Build web assets |
| `Cmd + R` | Run in simulator/device |
| `Cmd + B` | Build only |
| `Cmd + Shift + K` | Clean build folder |
| Product → Archive | Create distribution build |

---

## Version Updates

When updating the app:

1. Increment version in `Info.plist`:
   - `CFBundleShortVersionString` (e.g., 1.0.0 → 1.1.0)
   - `CFBundleVersion` (e.g., 1 → 2)

2. Rebuild web assets and copy to WebContent

3. Archive and upload new build
