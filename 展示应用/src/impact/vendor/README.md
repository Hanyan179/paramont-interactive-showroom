# Spatial motion reuse

`dreiMotion.js` adapts these pmndrs/drei implementations:

- https://github.com/pmndrs/drei/blob/master/src/core/Float.tsx
- https://github.com/pmndrs/drei/blob/master/src/materials/SpotLightMaterial.tsx

Retrieved 2026-09-20. MIT, copyright (c) 2020 react-spring. Full notice is distributed in `public/licenses/drei-MIT.txt`.

Adaptations: deterministic exhibit clock instead of random phase and an independent React frame callback; a four-sided scan frustum instead of a cone; local longitudinal attenuation instead of a depth texture. No React Three Fiber runtime was added. The original angular light attenuation and floating motion are retained.

Evaluated but not imported: `felixmariotto/three-mesh-ui` and `pmndrs/uikit` for spatial interfaces; `protectwise/troika` for text. The scene already owns its 3D panels, fixed local typography and shared event loop, so these layout/font runtimes are not needed for this change. Typed glyph reveal and robot expression choreography are project code, not attributed to those projects.
