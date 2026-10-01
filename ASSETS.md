# Original art production

All characters, environment geometry, layouts, music and interface elements were created for this project. No assets or level designs from FF14, DOOM or other existing games were used.

## AI-created wall texture

Tool: built-in imagegen skill / image_gen.imagegen.
Project asset: public/assets/citadel-wall.png (1024×1024, mapped on bevelled wall meshes).

Prompt:
> Use case: stylized-concept. Asset type: seamless square diffuse texture for actual 3D game environment walls. Create a richly hand-painted premium fantasy science fiction candy factory ceramic metal wall texture, edge-to-edge orthographic flat surface, no perspective, no scenery or characters. Deep indigo enamel panel divisions, turquoise machined inlays, aged gold carved ornamental channels, subtle purple candy-resin marbling, tiny believable surface scuffs, bevel edge highlights painted very subtly, intricate decorative star and spiral relief details. Elegant colorful ominous toybox citadel, polished stylized AAA game texture, strong medium scale material detail, restrained small detail. Must tile seamlessly on all four edges, no text, no logos, no UI, no border, no weapons. Not a concept scene: a directly usable flat texture map.

## Procedural textures and models

Canvas-generated stone, circuit panels, metal floors, contaminated floors, lava/toxic fluids, sky panorama and creature skins. Lathe, extruded silhouettes, curved tubes, articulated feet and custom assembled armor define the enemies. Static parts of each model are merged by material to reduce draw calls. Architecture uses bevelled panels, arches, towers, machinery, pipes, vats and furnace landmarks. All sources are included.

## Morning toy wood texture (v3)

Tool: built-in imagegen skill / image_gen.imagegen.
Project asset: public/assets/toy-wall-v3.png (1024×1024). Used on stage-one wall panels. Created for this project; no external stock license or attribution dependency. Stage-two candy and wafer textures are original Canvas generation.

Prompt:
> Use case: stylized-concept. Asset type: seamless square color/albedo texture for walls of an original bright toy-world 3D game, NOT a scene or screenshot. Orthographic flat front view, image filled edge to edge with intricately crafted painted wooden toy panels, honey maple wood grain, pastel mint, turquoise, coral and butter yellow enamel inlays, carved rounded stars, tiny brass rivets, curved geometric channels. Sophisticated contemporary stylized game art with tactile subtle wear, warm gentle craftsmanship, charming rather than infantile. Even diffuse lighting with no perspective, no cast shadows, no frame or border, no visible text, letters, numbers, logos, watermark or existing franchise motifs. Tileable repeat at every edge. Fine detailed wood fibers and lightly glazed material variation, restrained relief so useful as a bump texture. Bright readable finish, not dark dungeon metal.

## Item and creature texture revision

Original Canvas-generated object textures in src/world/ObjectTextures.ts and src/game/CreatureSkin.ts. Creature skins use 512×512 maps: glossy jelly swirls/dots, riveted robot panels, stitched balloon stripes, layered toxic scales, warm lava cracks and ornamental boss diamonds. Limbs and trim use shared rubber ribs, brushed metal, ivory grain and cork. Items use 256×256 heart/leaf bottle labels, striped candy wrappers, shields/circuits, flames, stars and rainbow enamel. No lettering or external assets. Maps are cached by family and reused; bump shading is applied to the actual game models and pickup previews.
