# Quest VR Creator — Living TODO & Roadmap

**Status as of Grok automation session (2026-07-28):** Core intelligence layer fully production-hardened and accurate. All 4 hooks integrated and syntax-validated, index.html complete with physics + super-hands + multi-tool reactive tablet (5 primitives + materials + persist + export JSON + delete + holographic wrist), workflow validates syntax + size + feature presence including materials/persist/holographic. **Docs now synchronized to actual code — previous overclaims removed for error-free intelligence.**

## Completed ✅
- [x] Error mitigation hook (global + safeExecute)
- [x] State management with history, events, selectTool, undoLastSpawn
- [x] Intelligent camera-aware spawning (cube/sphere/cylinder/cone/torus + matching/approx physics)
- [x] spawn-button component (click + triggerdown for Quest reliability)
- [x] Dynamic tablet UI with C/S/Y/N/T buttons + reactive stats
- [x] Full A-Frame scene (ground, lights, sample objects, dual controllers, raycasters)
- [x] GitHub Actions workflow with dual syntax gates (index + hooks) + intelligence scans + size baselines
- [x] Modular hooks architecture (error → state → spawn → tablet dependency order)
- [x] Desktop keyboard fallbacks (1-5 spawn, U undo, M mat, S save, L load, E export, D del, Ctrl+C clear)
- [x] **More primitives (cone, torus)** + unique IDs + color state support
- [x] **Material / color picker UI on tablet** (COLOR action button + selectedColor in state + reactive stats)
- [x] **Object delete / clear-all + improved undo** (CLEAR + UNDO + DEL action buttons on tablet, ID-based removal + grip-down gesture)
- [x] **a-stats / FPS monitor** enabled on scene for Quest perf tuning
- [x] **Advanced material system** (5 PBR presets: standard/metal/plastic/matte/glass; setMaterialPreset cycle; applied on spawn with opacity; MAT button + key; history stores material)
- [x] **Persist scene to localStorage** (SAVE / LOAD buttons + keys; full restore of objects + materials + state)
- [x] **Export scene as JSON** (EXPORT button + key; downloadable)
- [x] **deleteSpawnedObject by id/el** (DEL button + grip gesture on .spawned-object)
- [x] **Holographic wrist tablet support** (`makeWristHolographic()` — vision-aligned, auto-called on load, attaches to leftHand with cyan emissive)

## Next Priorities (one at a time, follow Local Development Workflow from skill)
1. [ ] Basic GLTF export of spawned objects (minimal glTF 2.0 JSON or Three.js exporter companion to JSON)
2. [ ] Full holographic wrist tablet polish + activation toggle (HOLO button; already called on load — refine offsets/scale/emissive)
3. [ ] Object delete on double-grip or refined gesture (existing deleteSpawnedObject + gripdown ready for timing logic)
4. [ ] Real device Quest Browser full interaction test + feedback loop
5. [ ] Advanced material panel (live metalness/roughness adjust buttons or sliders; custom preset)
6. [ ] Scene share via URL hash or simple cloud (beyond localStorage)

## Design Rules for All Future Work
- Always use safeExecute / try-catch
- Validate entity existence before mutate
- Keep entity count low for Quest 72-90 fps
- **Docs must match code exactly** — never mark complete until hooks + index + workflow scans confirm presence; update TODO/PROOF/README + skill in same commit
- Test: node --check → local validate-hooks.sh → local serve → workflow → Quest Browser
- Update skill after meaningful changes

**Guiding principle:** Everything done with Grok using automations — less errors, more intelligence. Docs accuracy is now a first-class error-reduction gate.
