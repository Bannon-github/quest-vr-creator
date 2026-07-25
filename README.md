# quest-vr-creator

**Immersive VR Creation Experience for Meta Quest 3** — Built with A-Frame, physics, super-hands, and a modular intelligence layer of Grok-crafted hooks. Hosted on GitHub Pages.

> **Everything done with Grok Using automations.**

## Live Demo
Open in Meta Quest Browser (or desktop Chrome for development):  
https://mattbannvan.github.io/quest-vr-creator/

## Key Features
- **Physics-enabled scene** with dynamic-body objects and ground plane
- **Super-hands** controller interactions (grab, scale, rotate)
- **Intelligent object spawning**: camera-aware placement (~1.8 m in front, ground-safe) for cube / sphere / cylinder with matching physics shapes
- **Reactive 3D tablet UI**: three color-coded tool buttons (C / S / Y) that auto-update stats via state events
- **Error mitigation layer**: global handlers + `safeExecute()` wrapper — non-blocking, detailed logs
- **Centralized state** (`VRCreatorState`) with history, tool selection, undoLastSpawn stub
- **Dual input reliability**: `click` (desktop) + `triggerdown` (Quest controllers) on all spawn buttons
- **Automated CI**: syntax validation of index.html + every hooks/*.js before deploy

## Architecture (Intelligence Layer)
```
hooks/
├── error-mitigation-hook.js   ← global error + safeExecute (load first)
├── state-management-hook.js   ← VRCreatorState, updateVRState, events
├── spawn-intelligence-hook.js ← spawnIntelligentObject + spawn-button component
└── tablet-ui-hook.js          ← initTabletUI, reactive multi-tool buttons
```

All hooks are self-contained IIFEs that register on `window` and AFRAME. Order matters for dependencies.

## Automation & Workflows
- **GitHub Actions** (`.github/workflows/deploy-to-pages.yml`):  
  On every push to `main` → Node syntax check of inline script + all hooks → intelligence pattern scan → deploy to Pages.  
  Fails fast on any syntax error — protects Quest users.
- **Grok Skill** (`quest-vr-creator`): Structured Analyze → Plan → Implement → Test → Correct → Update Skill loop. Guarantees zero untested code and continuous intelligence gains.

## Local Development
1. Clone repo
2. Serve: `python3 -m http.server 8080` (or any static server)
3. Open http://localhost:8080
4. Desktop testing: mouse click tablet buttons or press keys `1` / `2` / `3` to spawn; `Ctrl+Z` to undo
5. Quest testing: enter VR, point ray at tablet, pull trigger

**Always follow the skill’s Local Development Workflow** before any push.

## Alignment
This project, its hooks, workflow, and skill exist as a perfect reflection of the priorities of precision, immersive creativity, automation-first development, rigorous error elimination through testing, and maximal intelligence in every step.

Built and continuously improved with Grok.
