# Performance and hosting follow-up — 2026-10-06

The game rules, stage layout, placement, HP, damage, attack cooldowns, movement
speeds, weapon statistics and ending content are unchanged.

## Changes

- Removed SSAO and screen bloom. Surface normals, material AO, reflections,
  contact shadows and the decorative geometry remain.
- Ordinary desktops start at medium quality. Shadow resolution and render
  resolution budgets are smaller; sustained slow frames still reduce quality.
- Local lights use a fixed number of slots. Moving between rooms changes their
  positions, colors and intensity without changing shader light counts.
- Texture uploads and shader compilation happen during a short loading state.
  A GPU fence completes the loading draw before gameplay continues. Pending
  preparation can be cancelled safely when a stage resets.
- Item portraits compile and read back asynchronously, with cached results.
- Castle navigation reuses directed, collision-tested graph edges. Stage changes,
  door changes and the boss entrance invalidate the cache. BFS order and all
  collision checks are preserved. Floor queries no longer allocate temporary
  arrays in every collision/pathfinding step.
- A lost WebGL context pauses the game. Restoration rebuilds environment
  reflections and resumes rendering at low quality while preserving progress.
- Canonical URLs, structured data, share images and sitemap links now point to
  `https://masanari-ryu.github.io/toybox-adventure/`.

## Controlled comparison

The published commit `aeedb0a` was served in a separate temporary local directory
and compared with the updated code on the same development Mac and Chrome.
Both used stage 3, the same player location, and enemies alerted to the player.
Player HP was increased only inside the test harness to sustain the workload.
After initial setup, 16 seconds of active enemy simulation were measured.

| Viewport | Before FPS | After FPS | Before longest frame | After longest frame |
| --- | --- | --- | --- | --- |
| Desktop 1280×720 | 37.8 | 60.0 | 1766ms | 51ms |
| Phone emulation 844×390 | 59.0 | 60.0 | 583ms | 67ms |

The updated runs had no frames over 100ms in this comparison. Average castle
update time decreased from about 3ms to about 1ms. These measurements are a
specific workload, not a guarantee of frame rate on every device. Shooting and
movement are additionally covered by browser regression tests.

Development probes import the exact entry-script URL from the DOM, including
Vite's version query. Importing an unversioned entry can instantiate a second
game and invalidate measurements. Temporary probes are excluded from commits.

Physical phone/tablet hardware and prolonged thermal throttling remain unverified.

## Validation and release

- `npm test`: 69 tests passed across 19 files.
- `npm run build`: passed; the existing Three.js vendor size advisory remains.
- Full browser suite: 21 tests passed, covering 5 mobile/tablet sizes, the existing
  campaign checks, stairs, rail rides, endings and the new recovery scenarios.
- The 4 performance tests were rerun after adding movement plus sustained shooting.
  Desktop used keyboard movement; phone emulation held a movement pointer while
  tapping with a separate pointer. Both traveled over 27 meters in 8 seconds.
- The moving-combat tests recorded 95th-percentile frame gaps of 17.7ms / 17.6ms
  and maximum gaps of 50ms / 34.2ms (desktop / phone emulation).
- Rapid stage resets, item portrait cancellation and WebGL context restoration
  completed without browser script errors in these checks.
- The user approved permanent removal of the Cloudflare Pages project
  `toybox-adventure`. Deletion was confirmed in the Cloudflare project list.
  GitHub Pages is the remaining game hosting destination.
