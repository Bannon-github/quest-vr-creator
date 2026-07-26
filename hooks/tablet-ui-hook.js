/**
 * Tablet UI Hook for Quest VR Creator
 * Purpose: Dynamic, intelligent management of the 3D tablet UI for tool selection and object creation.
 * Allows adding multiple spawn buttons programmatically, updating title/stats, action buttons (undo/clear/save/load/export/mat).
 * Supports more primitives (cone, torus), reactive stats, consistent design, holographic wrist variant.
 * Reduces errors by validating entities before manipulation.
 * Intelligence: Reactive to state changes, easy to extend for new tools/colors/actions/materials.
 * Usage: Call initTabletUI() on load, or use components. Call makeWristHolographic() for vision alignment.
 * Tested: Syntax OK.
 */

(function() {
  'use strict';

  // Safe helper to get or create tablet entity
  function getTablet() {
    let tablet = document.querySelector('#tablet');
    if (!tablet) {
      console.warn('Tablet not found, creating fallback...');
      const scene = document.querySelector('a-scene');
      if (scene) {
        tablet = document.createElement('a-entity');
        tablet.id = 'tablet';
        tablet.setAttribute('position', '0 1.2 -1');
        tablet.setAttribute('geometry', 'primitive: plane; width: 0.95; height: 0.75');
        tablet.setAttribute('material', 'color: #1a1a44; shader: flat; opacity: 0.92; transparent: true');
        tablet.setAttribute('class', 'raycaster-target');
        scene.appendChild(tablet);
      }
    }
    return tablet;
  }

  // Update tablet title or add status text
  window.updateTabletUI = function(titleText = 'Object Creator', statsText = '') {
    return window.safeExecute(() => {
      const tablet = getTablet();
      if (!tablet) return false;

      let title = document.querySelector('#tablet-title');
      if (!title) {
        title = document.createElement('a-text');
        title.id = 'tablet-title';
        title.setAttribute('position', '0 0.32 0.01');
        title.setAttribute('align', 'center');
        title.setAttribute('color', '#FFFFFF');
        title.setAttribute('width', '0.9');
        title.setAttribute('value', titleText);
        tablet.appendChild(title);
      } else {
        title.setAttribute('value', titleText);
      }

      // Optional stats line
      let stats = document.querySelector('#tablet-stats');
      if (statsText || statsText === '') {
        if (!stats) {
          stats = document.createElement('a-text');
          stats.id = 'tablet-stats';
          stats.setAttribute('position', '0 -0.32 0.01');
          stats.setAttribute('align', 'center');
          stats.setAttribute('color', '#88FFAA');
          stats.setAttribute('width', '0.85');
          tablet.appendChild(stats);
        }
        stats.setAttribute('value', statsText);
      }
      return true;
    }, 'Update Tablet UI');
  };

  // Dynamically add a spawn button to tablet
  window.addSpawnButtonToTablet = function(config) {
    return window.safeExecute(() => {
      const tablet = getTablet();
      if (!tablet) return null;

      const btn = document.createElement('a-entity');
      btn.id = config.id || `btn-${config.type || 'cube'}`;
      const posX = config.position && config.position.x !== undefined ? config.position.x : -0.2;
      const posY = config.position && config.position.y !== undefined ? config.position.y : 0;
      btn.setAttribute('position', `${posX} ${posY} 0.01`);
      btn.setAttribute('geometry', 'primitive: box; width: 0.12; height: 0.12; depth: 0.04');
      btn.setAttribute('material', `color: ${config.color || '#4CC3D9'}; metalness: 0.2; roughness: 0.5`);
      btn.setAttribute('class', 'raycaster-target');
      
      // Attach spawn intelligence
      btn.setAttribute('spawn-button', `type: ${config.type || 'cube'}; color: ${config.color || ''}`);
      
      // Optional label text on button
      if (config.label) {
        const label = document.createElement('a-text');
        label.setAttribute('value', config.label);
        label.setAttribute('position', '0 0 0.05');
        label.setAttribute('align', 'center');
        label.setAttribute('color', '#FFFFFF');
        label.setAttribute('width', '0.11');
        label.setAttribute('scale', '0.55 0.55 0.55');
        btn.appendChild(label);
      }

      tablet.appendChild(btn);
      console.log(`✅ Added spawn button for ${config.type} to tablet`);
      return btn;
    }, 'Add Spawn Button to Tablet');
  };

  // Add action button (not spawn, for undo/clear etc)
  window.addActionButtonToTablet = function(config) {
    return window.safeExecute(() => {
      const tablet = getTablet();
      if (!tablet) return null;

      const btn = document.createElement('a-entity');
      btn.id = config.id || `action-${config.action || 'btn'}`;
      const posX = config.position && config.position.x !== undefined ? config.position.x : 0;
      const posY = config.position && config.position.y !== undefined ? config.position.y : -0.12;
      const w = config.width || 0.15;
      btn.setAttribute('position', `${posX} ${posY} 0.01`);
      btn.setAttribute('geometry', `primitive: box; width: ${w}; height: 0.09; depth: 0.04`);
      btn.setAttribute('material', `color: ${config.color || '#555577'}; metalness: 0.1; roughness: 0.6`);
      btn.setAttribute('class', 'raycaster-target');

      if (config.label) {
        const label = document.createElement('a-text');
        label.setAttribute('value', config.label);
        label.setAttribute('position', '0 0 0.05');
        label.setAttribute('align', 'center');
        label.setAttribute('color', '#FFFFFF');
        label.setAttribute('width', (w * 0.95).toFixed(2));
        label.setAttribute('scale', '0.45 0.45 0.45');
        btn.appendChild(label);
      }

      // Event handlers for actions
      const handler = () => {
        if (config.action === 'undo' && typeof window.undoLastSpawn === 'function') {
          window.undoLastSpawn();
        } else if (config.action === 'clear' && typeof window.clearAllSpawned === 'function') {
          window.clearAllSpawned();
        } else if (config.action === 'randomcolor' && typeof window.setSelectedColor === 'function') {
          if (window.VRCreatorState && window.VRCreatorState.selectedColor) {
            window.setSelectedColor(null);
          } else {
            const hues = ['#FFCC00', '#EF2D5E', '#4CC3D9', '#7BC8A4', '#FF9F1C', '#9B5DE5'];
            window.setSelectedColor(hues[Math.floor(Math.random() * hues.length)]);
          }
        } else if (config.action === 'save' && typeof window.saveSceneToStorage === 'function') {
          window.saveSceneToStorage();
        } else if (config.action === 'load' && typeof window.loadSceneFromStorage === 'function') {
          window.loadSceneFromStorage();
        } else if (config.action === 'export' && typeof window.exportSceneJSON === 'function') {
          window.exportSceneJSON();
        } else if (config.action === 'material' && typeof window.setMaterialPreset === 'function') {
          window.setMaterialPreset(); // cycles
        } else if (config.action === 'delete' && typeof window.deleteSpawnedObject === 'function') {
          // Delete last or hovered - for now last as simple
          const state = window.VRCreatorState;
          if (state && state.spawnedObjects && state.spawnedObjects.length) {
            const last = state.spawnedObjects[state.spawnedObjects.length - 1];
            window.deleteSpawnedObject(last.id);
          }
        }
        btn.emit('action-triggered', { action: config.action });
      };
      btn.addEventListener('click', handler);
      btn.addEventListener('triggerdown', handler);

      tablet.appendChild(btn);
      console.log(`✅ Added action button ${config.action} to tablet`);
      return btn;
    }, 'Add Action Button to Tablet');
  };

  // Make the tablet a holographic wrist variant (aligns to visions/vision-elements.md)
  window.makeWristHolographic = function() {
    return window.safeExecute(() => {
      const tablet = getTablet();
      const leftHand = document.querySelector('#leftHand');
      if (!tablet) return false;

      // Holographic material: cyan glow, semi-transparent, emissive feel
      tablet.setAttribute('material', 'color: #00E5FF; shader: flat; opacity: 0.72; transparent: true; emissive: #00AACC; emissiveIntensity: 0.3');
      tablet.setAttribute('geometry', 'primitive: plane; width: 0.85; height: 0.7');

      // Attach to left wrist if possible for holographic wrist tablet vision
      if (leftHand) {
        // Detach from scene root if needed and parent to hand
        if (tablet.parentNode) {
          tablet.parentNode.removeChild(tablet);
        }
        leftHand.appendChild(tablet);
        // Wrist offset: slightly above/forward of hand model, readable orientation
        tablet.setAttribute('position', '0.02 0.05 -0.12');
        tablet.setAttribute('rotation', '-60 0 0'); // tilt toward user view when looking at wrist
        console.log('✅ Tablet attached as holographic wrist variant to leftHand (vision aligned).');
      } else {
        // Fallback fixed position with holographic look
        tablet.setAttribute('position', '0 1.2 -0.85');
        tablet.setAttribute('rotation', '-20 0 0');
        console.log('✅ Tablet styled holographic (fixed pos fallback).');
      }

      // Subtle border/glow plane behind for holographic effect
      let glow = document.querySelector('#tablet-glow');
      if (!glow) {
        glow = document.createElement('a-entity');
        glow.id = 'tablet-glow';
        glow.setAttribute('geometry', 'primitive: plane; width: 0.9; height: 0.75');
        glow.setAttribute('material', 'color: #00FFFF; shader: flat; opacity: 0.18; transparent: true');
        glow.setAttribute('position', '0 0 -0.01');
        tablet.appendChild(glow);
      }

      if (window.VRCreatorState) {
        window.updateVRState({ ui: { ...(window.VRCreatorState.ui || {}), holographic: true } });
      }
      return true;
    }, 'Make Wrist Holographic');
  };

  // Initialize default multi-tool tablet UI (call on load) - expanded with new features
  window.initTabletUI = function() {
    return window.safeExecute(() => {
      const tablet = getTablet();
      if (!tablet) return;

      // Clear existing dynamic children (buttons)
      const existingButtons = tablet.querySelectorAll('[spawn-button], [id^="btn-"], [id^="action-"]');
      existingButtons.forEach(el => el.parentNode && el.parentNode.removeChild(el));

      // Expand tablet geometry for more buttons (consistent design)
      tablet.setAttribute('geometry', 'primitive: plane; width: 0.95; height: 0.78');

      // Row 1: 5 spawn tools (more primitives) - tighter spacing for consistent design
      const tools = [
        { type: 'cube', color: '#FFCC00', label: 'C', x: -0.34 },
        { type: 'sphere', color: '#EF2D5E', label: 'S', x: -0.17 },
        { type: 'cylinder', color: '#4CC3D9', label: 'Y', x: 0 },
        { type: 'cone', color: '#7BC8A4', label: 'N', x: 0.17 },
        { type: 'torus', color: '#9B5DE5', label: 'T', x: 0.34 }
      ];

      tools.forEach((tool) => {
        window.addSpawnButtonToTablet({
          id: `btn-${tool.type}`,
          type: tool.type,
          color: tool.color,
          label: tool.label,
          position: { x: tool.x, y: 0.18 }
        });
      });

      // Row 2: Core actions - Undo, Clear, Color, Mat
      window.addActionButtonToTablet({
        id: 'action-undo',
        action: 'undo',
        label: 'UNDO',
        color: '#FF6B6B',
        position: { x: -0.28, y: 0.02 },
        width: 0.16
      });
      window.addActionButtonToTablet({
        id: 'action-clear',
        action: 'clear',
        label: 'CLEAR',
        color: '#FF9F1C',
        position: { x: -0.09, y: 0.02 },
        width: 0.16
      });
      window.addActionButtonToTablet({
        id: 'action-color',
        action: 'randomcolor',
        label: 'COLOR',
        color: '#00F5D4',
        position: { x: 0.09, y: 0.02 },
        width: 0.16
      });
      window.addActionButtonToTablet({
        id: 'action-material',
        action: 'material',
        label: 'MAT',
        color: '#C77DFF',
        position: { x: 0.28, y: 0.02 },
        width: 0.16
      });

      // Row 3: Persist + Export + Delete (new features)
      window.addActionButtonToTablet({
        id: 'action-save',
        action: 'save',
        label: 'SAVE',
        color: '#2EC4B6',
        position: { x: -0.28, y: -0.12 },
        width: 0.16
      });
      window.addActionButtonToTablet({
        id: 'action-load',
        action: 'load',
        label: 'LOAD',
        color: '#3A86FF',
        position: { x: -0.09, y: -0.12 },
        width: 0.16
      });
      window.addActionButtonToTablet({
        id: 'action-export',
        action: 'export',
        label: 'EXPORT',
        color: '#8338EC',
        position: { x: 0.09, y: -0.12 },
        width: 0.16
      });
      window.addActionButtonToTablet({
        id: 'action-delete',
        action: 'delete',
        label: 'DEL',
        color: '#FF006E',
        position: { x: 0.28, y: -0.12 },
        width: 0.16
      });

      // Update title and initial stats from state
      const state = window.VRCreatorState || {};
      const matInfo = state.materialPreset ? ` | ${state.materialPreset}` : '';
      window.updateTabletUI(
        'VR Object Creator', 
        `Spawned: ${state.spawnedCount || 0} | Tool: ${state.selectedTool || 'cube'}${matInfo}`
      );

      // Listen for state changes to auto-update stats (reactive)
      if (!window._tabletStateListener) {
        document.addEventListener('vr-state-changed', (e) => {
          const s = e.detail.current || window.VRCreatorState;
          if (s) {
            const colorInfo = s.selectedColor ? ` | C:${s.selectedColor.slice(0,7)}` : '';
            const matP = s.materialPreset ? ` | ${s.materialPreset}` : '';
            window.updateTabletUI('VR Object Creator', `Spawned: ${s.spawnedCount || 0} | Tool: ${s.selectedTool || 'cube'}${colorInfo}${matP}`);
          }
        });
        window._tabletStateListener = true;
      }

      console.log('✅ Tablet UI initialized with 5 primitives + UNDO/CLEAR/COLOR/MAT/SAVE/LOAD/EXPORT/DEL + reactive stats + holographic ready.');
    }, 'Init Tablet UI');
  };

  console.log('✅ Tablet UI Hook loaded - dynamic, intelligent 3D interface ready (expanded features + wrist holographic).');
})();
