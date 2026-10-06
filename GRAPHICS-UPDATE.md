# Graphics update — 2026-10-06

This update changes rendering, character animation and cosmetic effects. Stage data,
enemy placement, AI, HP, damage, weapon statistics, item counts, controls,
progression and ending content are unchanged.

## Appearance

- Raised wall moulding, bevelled star badges, plates and bolts use chunked instancing.
- Floors have bevelled slab edges, narrow physical joints and small surface wear.
- Wood, metal, stone, plastic, rubber and fabric use distinct procedural normal,
  roughness, metalness and ambient-occlusion maps. Maps are shared and at most 256px.
- Environment reflections, local destination lighting and camera-following sun
  shadows add depth. The existing morning, noon and night progression is retained.
- Distant toy buildings, flags, hills, windmills and a toy train supplement the sky.
- Weapons retain their shapes and receive seams, screws, vents, illuminated panels,
  metallic fittings and cosmetic recoil parts. Lightning uses layered branching arcs.
- Characters have differentiated surface finishes, pupils and lids, additional
  articulated details and body deformation for anticipation, strikes and hits.
- Defeat sparks are batched in a single point cloud; contact shadows work without
  real-time shadows. Cosmetic projectile children do not affect collision.

## Automatic budgets

| Tier | Initial target | Pixel ratio cap | Sun shadow | Screen effects |
| --- | --- | --- | --- | --- |
| High | Desktop with at least 4 logical cores | 1.5 | 1536px | Reduced-resolution SSAO, restrained bloom |
| Medium | Tablet / lighter desktop | 1.2 | 768px | Direct rendering |
| Low | Phone | 1 | Contact shadows | Direct rendering |

Sustained slow frame windows reduce the tier. Nearby lights and decorative chunks
have distance limits. Meshes, materials and textures are shared; distant enemy
bodies are omitted beyond ranges longer than their detection range. Tank glass
uses transparent reflection rather than an additional transmission render pass.
All tiers use identical game rules.

## Verification

- Unit tests cover rendering budgets and animation invariants in addition to the
  existing gameplay suites.
- Browser regression tests cover the existing campaign checks, stairs and access,
  shooting, switches, items, touch input, pause, death, rail rides and both endings.
- Visual checks capture 15 scenes each at 1280×720, 844×390 and 1024×768:
  start, corridor, open door, combat, shot, chest, poison, train, floor overlook,
  upper boss room, night, samurai, katana, lightning and rail loop.
- The existing responsive tests also cover 360×800, 390×844 and 1366×1024.
- Screenshots are local test artifacts under `screenshots/visual-upgrade/`.

Browser mobile emulation runs on the development computer. It verifies viewport
layout and input behavior but does not establish performance on a physical phone
or tablet. Real-device frame rates and thermal behavior remain unverified.

## Recorded results

- `npm test`: 66 tests passed across 18 files.
- `npm run build`: passed. The shared Three.js vendor chunk still triggers the
  existing 500KB size advisory; there are no build errors.
- Full browser run: 17 tests passed. After the final automatic-budget adjustment,
  all 3 visual/performance tests were rerun and passed.
- No browser script or console errors in these checks.

Rendering measurements after a 16-second warm-up (stationary review scenes,
Chrome on the development Mac):

| Viewport | Stage 1 | Stage 3 | Upper boss room |
| --- | --- | --- | --- |
| Desktop 1280×720 | 60 FPS / high | 60 FPS / medium | 60 FPS / high |
| Phone 844×390 | 60 FPS / low | 60 FPS / low | 60 FPS / low |
| Tablet 1024×768 | 60 FPS / medium | 60 FPS / medium | 60 FPS / medium |

These are rendering reference measurements, not guarantees of combat frame rates
or measurements from physical mobile hardware. Initial shader compilation and
complex scenes may lower frame rate before the automatic budget settles.
