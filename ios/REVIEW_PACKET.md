# Kid Genius World - App Store Review Packet

## App Overview

**App Name:** Kid Genius World
**Bundle ID:** com.kidgeniusworld.app
**Category:** Kids (Ages 5 and Under, Ages 6-8)
**Version:** 1.0.0
**Platform:** iOS 15.0+

Kid Genius World is an educational game designed for children ages 4-11 that teaches math, reading, art, music, and problem-solving through interactive, engaging activities.

---

## 1. DATA COLLECTION DECLARATION

### Data Collected: **NONE**

This app collects **zero personal data**. Specifically:

| Data Type | Collected? | Details |
|-----------|------------|---------|
| Name | NO | - |
| Email | NO | - |
| Phone Number | NO | - |
| Physical Address | NO | - |
| Photos/Videos | NO | - |
| Contacts | NO | - |
| Location | NO | - |
| Health Data | NO | - |
| Device Identifiers (IDFA) | NO | AdSupport framework not included |
| User Tracking | NO | No NSUserTrackingUsageDescription |
| Browsing History | NO | - |
| Search History | NO | - |
| Analytics | LOCAL ONLY | On-device counters only, never transmitted |
| Crash Reports | NO | No crash reporting SDK |
| Usage Data | LOCAL ONLY | Progress saved to device only |

### Local Storage Only

The app stores the following data **locally on the device only**:
- Game progress (level, stickers, scores)
- Settings preferences (sound on/off)
- On-device play counters (never transmitted)

This data:
- Never leaves the device
- Cannot be accessed remotely
- Is deleted when the app is uninstalled
- Contains no personally identifiable information

---

## 2. PERMISSIONS REQUESTED

### Permissions: **NONE REQUIRED**

| Permission | Requested? | Reason |
|------------|------------|--------|
| Camera | NO | Not needed |
| Microphone | NO | Not needed |
| Location | NO | Not needed |
| Contacts | NO | Not needed |
| Photos | NO | Not needed |
| Bluetooth | NO | Not needed |
| Tracking (ATT) | NO | No tracking whatsoever |
| Push Notifications | NO | Not needed |
| Health | NO | Not needed |
| HomeKit | NO | Not needed |

The app requires **zero runtime permissions**.

---

## 3. PARENT GATE IMPLEMENTATION

### What It Protects
- External links (privacy policy, support)
- In-App Purchase screens
- Settings/parental controls

### How It Works
1. **Challenge Type:** Math problem (multiplication/division for adults)
2. **Difficulty:** Problems like "7 × 8 = ?" or "48 ÷ 6 = ?"
3. **Options:** 4 multiple choice answers (shuffled)
4. **Lockout:** After 3 wrong attempts, 30-second cooldown
5. **Session:** Gate stays unlocked for 5 minutes, then auto-locks

### Why It's Child-Resistant
- Problems use multiplication/division (typically not mastered until ages 9-10)
- Numbers range from 6-12, producing results children won't easily guess
- Wrong answers look plausible (close to correct answer)
- Lockout prevents brute force guessing

### Code Location
- `Sources/ParentGateView.swift` - Full implementation

---

## 4. EXTERNAL LINKS PROTECTION

### Blocked by Default
All external navigation is blocked:
- HTTP/HTTPS links are intercepted
- `mailto:` links are blocked
- `tel:` links are blocked
- JavaScript `window.open()` is blocked
- Popups are blocked

### Links Allowed (After Parent Gate)
- Privacy Policy URL
- Support/Help URL
- App Store (for rating prompt - future)

### Technical Implementation
```swift
// In GameWebView.swift
func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction,
             decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {

    // Only allow bundled file:// URLs
    if url.isFileURL {
        decisionHandler(.allow)
        return
    }

    // Block ALL external navigation
    decisionHandler(.cancel)
    parent.onExternalLinkRequested?(url)  // Triggers parent gate
}
```

---

## 5. ADVERTISING & MONETIZATION

### Current Version: AD-FREE

This initial release contains **no advertising**.

### Future AdMob Integration (Kids Category Compliant)

When adding ads, the app will:
1. Use Google AdMob with **"max_ad_content_rating": "G"** (child-safe)
2. Set **"tag_for_child_directed_treatment": 1** (COPPA compliant)
3. Use **contextual ads only** (no behavioral/personalized ads)
4. Place ads **behind parent gate**
5. NOT use reward videos that could pressure children

### In-App Purchases

If IAP is added:
- All purchases via Apple's IAP (no external payment links)
- Purchase UI protected by parent gate
- No "Buy Now" pressure tactics for children
- Clear pricing in parent currency

---

## 6. KIDS CATEGORY COMPLIANCE CHECKLIST

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| No third-party analytics | ✅ | On-device only counters |
| No third-party advertising (or child-safe only) | ✅ | Currently ad-free |
| No links out of app (or behind parent gate) | ✅ | All links blocked or gated |
| No behavioral advertising | ✅ | No ads currently |
| No user-generated content | ✅ | No UGC features |
| No social features | ✅ | No chat, messaging, or social |
| No push notifications (or essential only) | ✅ | No push notifications |
| Privacy policy link (behind parent gate) | ✅ | Parent gate required |
| Age-appropriate content | ✅ | Educational, non-violent |
| No in-app purchases pressuring kids | ✅ | Parent gate + no pressure |
| COPPA compliant | ✅ | No data collection |
| Parent gate for external actions | ✅ | Math challenge gate |

---

## 7. NETWORK & OFFLINE BEHAVIOR

### Offline-First Design
- All game content bundled in app
- Game fully functional without internet
- No required network calls

### Network Usage
| Feature | Network Required? |
|---------|-------------------|
| Core gameplay | NO |
| Math problems | NO (generated locally) |
| Reading exercises | NO |
| Art activities | NO |
| Music activities | NO |
| Progress saving | NO (local storage) |
| Text-to-speech | NO (native iOS/Web Speech API) |

### App Transport Security
```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <false/>
</dict>
```
All network access is blocked by default.

---

## 8. PRIVACY POLICY

Include this privacy policy on your website and link in App Store Connect:

```
PRIVACY POLICY FOR KID GENIUS WORLD

Last Updated: [DATE]

Kid Genius World is designed with children's privacy as our top priority.

INFORMATION WE COLLECT: NONE

We do not collect, store, or transmit any personal information. This includes:
- Names, emails, or contact information
- Photos, videos, or audio recordings
- Location data
- Device identifiers or advertising IDs
- Browsing or search history
- Any information about the child or parent

LOCAL DATA ONLY

The app stores game progress (levels, scores, stickers) locally on your device only. This data:
- Never leaves your device
- Cannot be accessed by us or any third party
- Is automatically deleted when you uninstall the app
- Contains no personal information

ADVERTISING

[If ad-free]: This app contains no advertising.
[If using AdMob]: This app shows child-safe, contextual advertisements only.
We do not use behavioral advertising or tracking.

THIRD PARTIES

We do not share any information with third parties because we do not collect any information.

CHILDREN'S PRIVACY (COPPA)

This app complies with the Children's Online Privacy Protection Act (COPPA). We do not knowingly collect personal information from children under 13.

PARENT GATE

External links and any purchase options require a parent to solve a math challenge, preventing accidental navigation by children.

CONTACT

For privacy questions: [YOUR EMAIL]

CHANGES

We will update this policy if our practices change. The "Last Updated" date will reflect any changes.
```

---

## 9. APP STORE CONNECT SETTINGS

### Age Rating Questionnaire

| Question | Answer |
|----------|--------|
| Cartoon or Fantasy Violence | None |
| Realistic Violence | None |
| Sexual Content or Nudity | None |
| Profanity or Crude Humor | None |
| Alcohol, Tobacco, or Drug Use | None |
| Mature/Suggestive Themes | None |
| Simulated Gambling | None |
| Horror/Fear Themes | None |
| Medical/Treatment Information | None |
| Unrestricted Web Access | NO |
| Gambling and Contests | NO |

**Result:** Rated 4+ (suitable for all ages)

### Kids Category Selection

1. Primary Category: **Kids**
2. Secondary Category: **Education**
3. Age Band: Select **both**:
   - Ages 5 and Under
   - Ages 6-8

### App Privacy (App Store Connect)

When completing the App Privacy section:

1. **Do you collect data?** → **No, we do not collect data from this app**

That's it! Since we collect nothing, no further privacy details are needed.

---

## 10. TESTFLIGHT CHECKLIST

Before submitting for TestFlight:

### Build Verification
- [ ] App launches without crash
- [ ] All rooms load correctly (Math, Reading, Art, Music, Puzzle, Playground)
- [ ] Progress saves and loads correctly
- [ ] Sound effects work
- [ ] Text-to-speech works (tap guide character)
- [ ] Parent gate appears for external actions
- [ ] Parent gate math challenge works correctly
- [ ] Wrong answers are rejected
- [ ] Correct answer unlocks gate
- [ ] App works in airplane mode (offline)

### Device Testing
- [ ] iPhone SE (smallest screen)
- [ ] iPhone 15 Pro Max (largest phone)
- [ ] iPad (tablet layout)
- [ ] Portrait orientation
- [ ] Landscape orientation

### Code Signing
- [ ] Development Team configured in Xcode
- [ ] Signing certificate valid
- [ ] Provisioning profile valid
- [ ] Bundle ID matches App Store Connect

### Submission
1. Archive build in Xcode (Product → Archive)
2. Validate archive
3. Upload to App Store Connect
4. Add build to TestFlight
5. Submit for Beta App Review (if external testers)

---

## 11. FILES & STRUCTURE

```
ios/
├── KidGeniusWorld.xcodeproj/
│   └── project.pbxproj
├── KidGeniusWorld/
│   ├── Info.plist              # App configuration (no tracking!)
│   ├── KidGeniusWorld.entitlements
│   ├── Assets.xcassets/        # App icons, colors
│   ├── Resources/
│   │   └── LaunchScreen.storyboard
│   ├── WebContent/             # Bundled game files
│   │   ├── index.html
│   │   └── assets/
│   └── Sources/
│       ├── KidGeniusWorldApp.swift    # App entry point
│       ├── ContentView.swift          # Main view + parent gate trigger
│       ├── GameWebView.swift          # WKWebView wrapper
│       ├── ParentGateView.swift       # Child-resistant gate
│       └── Services/
│           ├── SpeechService.swift    # Native TTS (free, offline)
│           ├── ProgressStore.swift    # Local-only storage
│           └── OnDeviceAnalytics.swift # Local counters only
└── REVIEW_PACKET.md            # This document
```

---

## 12. REVIEWER NOTES

If asked by Apple Review:

**Q: How do you protect children's privacy?**
A: We collect zero data. All progress is stored locally on-device only and never transmitted.

**Q: Does the app have advertising?**
A: [Version 1.0] No advertising. [Future] AdMob with child-safe, contextual ads only.

**Q: How does the parent gate work?**
A: Adults must solve a multiplication/division math problem (e.g., "7 × 9 = ?") to access external links or settings. Children typically cannot solve these problems.

**Q: Does the app work offline?**
A: Yes, 100% offline. All content is bundled in the app.

**Q: What SDKs/frameworks do you use?**
A: Only Apple-native frameworks: SwiftUI, WebKit, AVFoundation. No third-party SDKs.

---

## SUMMARY

Kid Genius World is built from the ground up for Kids Category compliance:

- **Zero data collection**
- **Zero permissions required**
- **Zero third-party SDKs**
- **100% offline capable**
- **Parent gate for all external actions**
- **Age-appropriate educational content**

The app is ready for App Store submission.
