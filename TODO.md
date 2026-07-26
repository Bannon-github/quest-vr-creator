# Quest VR Creator — Living TODO & Roadmap

**Status as of latest Grok automation session (2026-07-26):** Core intelligence layer fully restored, hardened, and extended. All hooks integrated, index.html complete with physics + super-hands + multi-tool reactive tablet (materials + persist + holographic actions), workflow validates everything including new feature scans. **Materials + persistence + export + delete + holographic readiness fully implemented and wired.**

## Completed ✅
- [x] Error mitigation hook (global + safeExecute)
- [x] State management with history, events, selectTool, undoLastSpawn
- [x] Intelligent camera-aware spawning (cube/sphere/cylinder + matching physics)
- [x] spawn-button component (click + triggerdown for Quest reliability)
- [x] Dynamic tablet UI with C/S/Y buttons + reactive stats
- [x] Full A-Frame scene (ground, lights, sample objects, dual controllers, raycasters)
- [x] GitHub Actions workflow with dual syntax gates (index + hooks) + intelligence scans
- [x] Modular hooks architecture (error → state → spawn → tablet dependency order)
- [x] Desktop keyboard fallbacks (1/2/3 spawn, Ctrl+Z undo)
- [x] **More primitives (cone, torus)** + unique IDs + color state support
- [x] **Material / color picker UI on tablet** (COLOR action button + selectedColor in state + reactive stats)
- [x] **Object delete / clear-all + improved undo** (CLEAR + UNDO action buttons on tablet, ID-based removal)
- [x] **a-stats / FPS monitor** enabled on scene for Quest perf tuning
- [x] **Advanced material system** (5 PBR presets: standard/metal/plastic/matte/glass; setMaterialPreset cycle; applied on spawn with opacity; MAT button + key; history stores material)
- [x] **Persist scene to localStorage** (SAVE / LOAD buttons + keys; full restore of objects + materials + state)
- [x] **Export scene as JSON** (EXPORT button + key; downloadable)
- [x] **deleteSpawnedObject by id** (DEL button + ready for gesture binding)
- [x] **Holographic wrist tablet support** (`makeWristHolographic()` — vision-aligned, attachable to leftHand)

## Next Priorities (one at a time, follow Local Development Workflow)
1. [ ] Basic export of spawned objects as GLTF (Three.js exporter) — optional companion to JSON
2. [ ] Full holographic wrist tablet activation + polish (call makeWristHolographic on load or toggle)
3. [ ] Object delete on double-grip or specific gesture (bind existing deleteSpawnedObject)
4. [ ] Real device Quest Browser full interaction test + feedback loop
5. [ ] Advanced material panel (sliders for live metalness/roughness instead of presets only)
6. [ ] Scene share via URL hash or simple cloud (beyond localStorage)

## Design Rules for All Future Work
- Always use safeExecute / try-catch
- Validate entity existence before mutate
- Keep entity count low for Quest 72-90 fps
- Update this TODO + skill after meaningful changes
- Test: node --check → local serve → workflow → Quest Browser

**Guiding principle:** Everything done with Grok using automations — less errors, more intelligence.
