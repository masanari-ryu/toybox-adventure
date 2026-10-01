# Verification record — three-stage rebuild

Date: 2026-09-30. The earlier sections record the previous rebuild. Latest dungeon revision results are recorded below.

## Passed

- Dependency installation: `npm install --offline --ignore-scripts`, successful; 65 packages audited, 0 reported vulnerabilities. Uses the existing registry cache and lockfile.
- TypeScript + `npm run build`: successful. Three.js produces a 532KB minified vendor chunk warning; no build errors.
- `npm test`: 13 tests across 5 files passed. Covers stage count, traversable routes to all pickups with solid machine collision, switch reachability/order, fog/closed-gate information hiding, weapon locks/upgrades, supplies, beginner difficulty, hit alert/memory, music durations and distinct arrangement layers, kana UI data.
- Actual in-app WebGL harness: all 61 checks passed. Includes independent pointer movement/look/fire/release, jumping/dash, pickup pause and 3D preview, item use, remote-hit AI activation and movement, enemy memory, doors, transitions, stage growth, weapons, poison/cure, armor, hazard switches, lava, bridge timeout, sunset/night, finite stars, boss gate, multiple boss attacks, death, ending, retry/reset, and visible kana-only text.
- Regression: ending update called again after returning to room, without throwing. Earlier continuous play exposed a null-fog update; it was fixed by applying the room transition once.
- Repeated the 61 browser checks at 360×800, 390×844, 844×390, 1024×768, 1366×1024: all passed, no fresh browser console errors. Results in screenshots/v3/viewport-checks.json.
- Real-time campaign using normal movement, aiming, firing, switching, healing, interaction and jump inputs: **113.9 seconds, 0 retries**, all three stages, fragments, boss defeat, portal and final room. No campaign teleports, direct enemy damage or invulnerability. The bot knows the map and follows checkpoints; this is not a novice completion-time estimate.
- Production assets opened at `/dist/index.html`: title, start story card, stage-one gameplay, expanded/collapsed map and pause worked.
- Portrait overlay at both phone sizes; disappears automatically on landscape resize.
- Screenshot review: 9 PC scenes; 11 phone-landscape scenes; 5 tablet scenes; both portrait sizes and large-tablet boss. Current images in screenshots/v3/.
- Source scan: no TODO, FIXME or placeholder markers in src/tests.

The browser feature harness uses teleport checkpoints and explicit damage for individual assertions. The separate real-time campaign verifies ordinary input progression.

## Improvement passes

1. Rebuilt three independent maps and progression. Browser assertions revealed invalid star coordinates; corrected the hemisphere sampling. Added actual item/weapon model previews, remembered AI routes, distinct stage materials, smooth evening/night lighting, and enemy facing.
2. Continuous normal-input play revealed the ending null-fog crash. Fixed it and repeated the campaign to completion. Moved pickups/enemies out of machines, added machine collision/LOS, corrected door/gate orientation, brightened night readability, refined synth timbre, enriched the final bedroom, and adjusted mobile/tablet UI sizes.

## Music evidence

Actual browser playback after instrument/mix refinements:

| Theme | Loop | Observed playback | Full-render peak | RMS |
|---|---:|---:|---:|---:|
| title | 68.57s | 78s+ | .319 | .032 |
| morning | 62.95s | 163s+ | .341 | .041 |
| factory | 60.95s | 104s+ | .327 | .042 |
| castle | 64.00s | 82s+ | .323 | .040 |
| boss | 58.18s | 42s+ | .374 | .056 |

All full-track stereo renders stayed below clipping. Context remained running, arrangement advanced through sections and looped. Separate bass, chord, lead, pluck, percussion and drum layers, fills, combat intensity, bar-aligned mode switching and fanfare are tested. Raw browser status records are in screenshots/v3/music-*.txt. Instrument refinements reduced lead cutoff, softened attack, and adjusted pluck/bass harmonic balance.

These are playback and signal/arrangement checks. Subjective commercial soundtrack quality, a human listening session and ten-minute listening comfort are **not certified** by this record.

## Limitations

- Independent Playwright CLI E2E suite is supplied but did not run successfully in this sandbox: local server binding was rejected with EPERM; an earlier Chromium process also encountered macOS MachPortRendezvous restrictions. In-app browser tests passed; do not confuse them with a passing CLI Playwright run.
- Viewport and synthetic multi-pointer tests do not establish physical iPhone/Android ergonomics, device GPU performance or sustained 30/60 FPS. Adaptive DPR, shadows and particle limits are implemented, but physical-device performance is unverified.
- Original stylized browser art is implemented; equivalence to FF14-scale commercial art quality is not claimed.
- Public deployment remains incomplete. A Site was registered, but source upload was rejected by automatic approval policy despite network permission grants. No live public URL is claimed. The dist output is ready for static hosting.

## Follow-up: textures, encounter placement and factory music

- All six enemy types now have stronger original surface patterns; limbs and trim receive separate material textures. All item bodies receive type-specific maps, with bottle labels and cork details.
- Stage one: six enemies distributed 1 / 2 / 3 across the opening floor, later plaza and final rooms. The starting area remains clear, beginner stats unchanged. Stage two: nine spaced enemies with robot placement behind the machine and additional middle/upper-room encounters. Stage three: eight ordinary enemies plus the boss, moved toward room edges and corners.
- Enemy placement test confirms valid collision positions, isolated first encounter and bounded stage totals.
- Factory melody rewritten: the previous blanket transposition introduced notes outside the song's major scale. The new four-bar melody follows the harmony. Added major-key regression check. Delay now follows the eighth-note tempo, factory wet level reduced from .15 to .055, feedback from .23 to .12, with 2800Hz low-pass filtering on echoes.
- 15 unit tests passed; production build and the 61 browser feature checks passed. Placement-adjusted real-time campaign completed in 115.7s with zero retries, before the subsequent texture contrast and music refinements.
- Current texture screenshots: screenshots/textures/. Browser factory playback passed a full 60.95-second loop after the melody/delay fix. No subjective listening claim is made.

Factory music final render after correction: 60.95s, peak .333, RMS .042, no clipping. Browser playback observed at 183s, context running; no browser console errors. Source build after final texture contrast correction passed.

## Current dungeon and room-awareness revision

- Exactly three stages; progressively larger grids: 19×13, 25×17, 29×22. A regression test counts reachable floor cells and confirms a strictly increasing playable area.
- Main route with short dead-end branches. Every stage has one boss and a locked reward room beyond it; no switch opens that room. Boss defeat opens the door; both the fragment and boss defeat are required for the exit.
- First-stage ordinary enemies remain weak (six), with a small introductory boss using single projectiles and jumps. Later bosses add spread shots, shockwaves and summons.
- Idle enemies facing the player react throughout their room when line of sight is clear. Back-facing idle enemies ignore room entry; hit alert and remembered pursuit still activate them. Walls, closed doors and machine cover block vision.
- 20 unit tests across six files passed; covers all pickup/switch reachability, reward-room locking, boss access, increasing playable area, room-awareness facing/cover, progression, AI, items, weapons, map, music and kana text.
- Current actual WebGL feature harness: all 70 checks passed, including first/second/final bosses opening their own reward rooms and the fragment-alone progression restriction.
- Production build passed after dungeon/AI changes. No build errors; the existing Three.js vendor-size warning remains.

- Current normal-input campaign completed in 102.4 seconds with zero retries; all three bosses, reward rooms and stage exits traversed. This map-aware bot is not a novice-time estimate.
- After the harmony corrections, 22 unit tests and the production build passed. Major-key harmony and strong-beat chord alignment now tested for all five themes; live delay changes use a fixed tap after fading, rather than a pitch-bending glide.
- Castle: observed 64-second loop playback beyond 64 seconds; full render peak .322, RMS .040. Factory: observed playback beyond 148 seconds; 60.95-second full render peak .495, RMS .042. No clipping in either render; no subjective listening certification.
- New boss screenshots: screenshots/dungeon/boss1.png, boss2.png, boss3.png. Each shows the stage-specific boss size and textured model.
- The current viewport capability accepted all five requested sizes, but a DOM measurement showed 1280×720 rather than the requested 844×390. The 70 checks passed repeatedly, but these current runs do not certify the requested viewport sizes. Earlier viewport records remain historical evidence, not current device-performance certification.

- Boss revised full render: 58.18 seconds, peak .374, RMS .056; observed playback 112 seconds, no console errors. Development review snapshots now mute BGM to avoid mixing with the music review page. Hidden game tabs suspend their audio context and resume from the start/continue gesture.

- Final production build smoke check: /dist/index.html title, story card, stage-one gameplay and pause passed; no console errors. Final browser feature harness: all 70 checks passed after audio suspension changes.

## Mobile start failure and gesture controls

- Reproduced the startup-class failure with an absent `document.exitPointerLock`: item/story hold throws before showing the dialog, leaving the state frozen. All release/request calls now guard unavailable APIs. Touch detection includes maxTouchPoints and any coarse pointer; actual touch pointer input also enables mobile mode.
- Replaced stick/fire/jump/dash panels with one-finger swipe look, tap fire, two-finger held drag movement/strafe, two-finger tap jump. Third-finger tap fires while moving. HUD buttons are separate from the gesture surface; item picker buttons now select potion/antidote before use.
- Mobile renderer disables antialiasing by default in addition to the existing lower DPR/no shadows.

- Verified the failure before the fix: `TypeError: document.exitPointerLock is not a function` stopped the WebGL harness at the first item card. After the fix, all 70 checks passed with that API disabled, including gesture movement/look/tap firing, two-finger strafe/jump and UI item selection/use. 22 unit tests and production build passed.
- Published successfully to the existing Netlify site at 23:49 JST on 2026-09-30, deployment 6abd217d42a1f31167b57cfb. The public HTML loads index-BT47OSKw.js, matching the current build.
- Public site smoke check in Chrome's iPhone 16 emulation at 852×393: title, mobile story instructions, card dismissal, game HUD without movement/fire panels, and swipe look visibly worked. Physical-phone performance remains unverified. Screenshot: screenshots/mobile-gestures/public-mobile.png.
- Netlify publication supersedes the earlier blocked Sites deployment; the live URL is https://calm-youtiao-b574f3.netlify.app/ .

## Crosshair hold controls and automatic settings (2026-10-01)

- Single-finger hold above the crosshair moves forward; below moves backward. 24px central neutral band and 180ms hold detection keep quick taps from moving. Long holds do not shoot on release. Single-finger horizontal swipe still turns the view; two fingers control only lateral strafe, without accidental forward/back movement.
- Removed music preview, music/effect checkboxes and quality selector from title/pause. Music starts from the start gesture. Touch detection, lower mobile pixel ratio, mobile antialias/shadow reduction and adaptive frame-rate rendering remain automatic.
- 22 unit tests, production build and 72 browser checks passed with unavailable pointer-lock API, including held forward/back input, no unwanted shot after hold, strafe, tap firing, jumping, item selection/use and progression.
- Production title loads with only the start button and brief controls; no settings or preview selectors. Current build asset index-C4t---T2.js.
- Netlify update pending while the user is actively controlling Chrome; no claim that this revision has been published yet.

公開確認（2026-10-01）：Netlify公開URLで index-C4t---T2.js を確認。音楽試聴・音楽設定・効果音設定・画質選択の要素数0。公開反映完了。

2026-10-01 難易度・死亡選択・撃破演出・音楽改訂：通常敵9/15/22体、通常敵HP倍率維持、全敵サイズ20%増。ボスHP230/540/1800。毒・まひ3秒・全方向弾、巡回、被弾揺れ。ブラウザ81項目／Vitest23項目／Production Build成功。死亡時の誤タップ再開防止と終了選択も検証。

最新改訂：通常敵15/22/32体へ増員。23単体テスト成功。特設ページ・説明書・利用規約を390px幅で確認、横はみ出しなし。
