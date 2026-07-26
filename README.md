# quest-vr-creator

**Immersive VR Creation Experience for Meta Quest 3** — Built with A-Frame, physics, super-hands, and a modular intelligence layer of Grok-crafted hooks. Hosted on GitHub Pages.

> **Everything done with Grok Using automations.**

## Live Demo
Open in Meta Quest Browser (or desktop Chrome for development):  
https://mattbannvan.github.io/quest-vr-creator/

## Key Features
- **Physics-enabled scene** with dynamic-body objects and ground plane
- **Super-hands** controller interactions (grab, scale, rotate)
- **Intelligent object spawning**: camera-aware placement (~1.8 m in front, ground-safe) for **cube / sphere / cylinder / cone / torus** with matching or approximate physics shapes, unique IDs, and color control
- **Reactive 3D tablet UI**: five color-coded tool buttons (C / S / Y / N / T) + UNDO / CLEAR / COLOR action buttons that auto-update stats via state events
- **Error mitigation layer**: global handlers + `safeExecute()` wrapper — non-blocking, detailed logs
- **Centralized state** (`VRCreatorState`) with history (id/type/pos/color), tool selection, selectedColor, `undoLastSpawn()`, `clearAllSpawned()`
- **Dual input reliability**: `click` (desktop) + `triggerdown` (Quest controllers) on all interactive elements
- **Performance monitoring**: `stats` component for FPS / entity counts (Quest 72-90 fps tuning)
- **Automated CI**: multi-layer syntax validation of index.html + every hooks/*.js + size/content + feature presence checks before deploy

## Architecture (Intelligence Layer)
```
hooks/
├── error-mitigation-hook.js   ← global error + safeExecute (load first)
├── state-management-hook.js   ← VRCreatorState, updateVRState, events, undo, clear, color
├── spawn-intelligence-hook.js ← spawnIntelligentObject (5 primitives) + spawn-button component
└── tablet-ui-hook.js          ← initTabletUI, 5 tools + 3 actions, reactive multi-tool buttons
```

All hooks are self-contained IIFEs that register on `window` and AFRAME. Order matters for dependencies.

## Automation & Workflows
- **GitHub Actions** (`.github/workflows/deploy-to-pages.yml`):  
  On every push to `main` → Node syntax check of inline script + all hooks (hard fail on missing/small/broken) → intelligence + expanded-feature pattern scan → deploy to Pages.  
  Fails fast on any syntax or critical intelligence regression — protects Quest users.
- **Grok Skill** (`quest-vr-creator`): Structured Analyze → Plan → Implement → Test → Correct → Update Skill loop. Guarantees zero untested code and continuous intelligence gains. Local hooks mirror production.

## Local Development
1. Clone repo
2. Serve: `python3 -m http.server 8080` (or any static server)
3. Open http://localhost:8080
4. Desktop testing: mouse click tablet buttons or press keys `1`–`5` to spawn (cube/sphere/cyl/cone/torus); `U` to undo; `Ctrl+C` to clear all
5. Quest testing: enter VR, point ray at tablet, pull trigger; grab/scale/rotate with super-hands

**Always follow the skill’s Local Development Workflow** before any push.

## Alignment
This project, its hooks, workflow, and skill exist as a perfect reflection of the priorities of precision, immersive creativity, automation-first development, rigorous error elimination through testing, and maximal intelligence in every step.

Built and continuously improved with Grok.
