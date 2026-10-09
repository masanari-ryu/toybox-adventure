/** Alternate candy pastels, with unchanged light strength, silhouettes and collision. */
export const nightmarePalettes=[
 {wall:0xddc5ff,top:0xa590e8,bottom:0xffdfc9,nightTop:0x373c87,nightBottom:0xaaa1d8,cloud:0xffe6f1},
 {wall:0xaff8e9,top:0x70d8bf,bottom:0xe5d8ff,nightTop:0x373c87,nightBottom:0xaaa1d8,cloud:0xfff2d9},
 {wall:0xf8c6ed,top:0xca8be6,bottom:0x9decdf,nightTop:0x373c87,nightBottom:0xaaa1d8,cloud:0xc4eefa},
]as const;
/** Recolor painted surfaces after sampling: their patterns, normal maps and roughness stay intact. */
export function parallelWallFinish<M extends import('three').MeshStandardMaterial>(material:M,stage:number){
 const channels=stage===1?'gbr':'brg';material.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>\ndiffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.${channels}, 0.55);`);};material.customProgramCacheKey=()=>`toy-parallel-wall/${stage}`;return material;
}
