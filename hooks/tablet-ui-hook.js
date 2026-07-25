/**
 * Tablet UI Hook for Quest VR Creator
 * Purpose: Dynamic, intelligent management of the 3D tablet UI for tool selection and object creation.
 * Allows adding multiple spawn buttons programmatically, updating title/stats, action buttons (undo/clear).
 * Supports more primitives (cone, torus), reactive stats, consistent design.
 * Reduces errors by validating entities before manipulation.
 * Intelligence: Reactive to state changes, easy to extend for new tools/colors/actions.
 * Usage: Call initTabletUI() on load, or use components.
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
        tablet.setAttribute('geometry', 'primitive: plane; width: 0.9; height: 0.7');
        tablet.setAttribute('material', 'color: #1a1a3e; shader: flat; opacity: 0.92');
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
        title.setAttribute('position', '0 0.28 0.01');
        title.setAttribute('align', 'center');
        title.setAttribute('color', '#FFFFFF');
        title.setAttribute('width', '0.8');
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
          stats.setAttribute('position', '0 -0.28 0.01');
          stats.setAttribute('align', 'center');
          stats.setAttribute('color', '#88FFAA');
          stats.setAttribute('width', '0.75');
          tablet.appendChild(stats);
        }
        stats.setAttribute('value', statsText);
      }
      return true;
    }, 'Update Tablet UI');
  };

  // Dynamically add a spawn button to tablet
  // @param {string} id, type, label, color, position e.g. {x: -0.2, y:0 }
  window.addSpawnButtonToTablet = function(config) {
    return window.safeExecute(() => {
      const tablet = getTablet();
      if (!tablet) return null;

      const btn = document.createElement('a-entity');
      btn.id = config.id || `btn-${config.type || 'cube'}`;
      const posX = config.position && config.position.x !== undefined ? config.position.x : -0.2;
      const posY = config.position && config.position.y !== undefined ? config.position.y : 0;
      btn.setAttribute('position', `${posX} ${posY} 0.01`);
      btn.setAttribute('geometry', 'primitive: box; width: 0.13; height: 0.13; depth: 0.04');
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
        label.setAttribute('width', '0.12');
        label.setAttribute('scale', '0.6 0.6 0.6');
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
      btn.setAttribute('position', `${posX} ${posY} 0.01`);
      btn.setAttribute('geometry', 'primitive: box; width: 0.18; height: 0.1; depth: 0.04');
      btn.setAttribute('material', `color: ${config.color || '#555577'}; metalness: 0.1; roughness: 0.6`);
      btn.setAttribute('class', 'raycaster-target');

      if (config.label) {
        const label = document.createElement('a-text');
        label.setAttribute('value', config.label);
        label.setAttribute('position', '0 0 0.05');
        label.setAttribute('align', 'center');
        label.setAttribute('color', '#FFFFFF');
        label.setAttribute('width', '0.16');
        label.setAttribute('scale', '0.5 0.5 0.5');
        btn.appendChild(label);
      }

      // Event handlers for actions
      const handler = () => {
        if (config.action === 'undo' && typeof window.undoLastSpawn === 'function') {
          window.undoLastSpawn();
        } else if (config.action === 'clear' && typeof window.clearAllSpawned === 'function') {
          window.clearAllSpawned();
        } else if (config.action === 'randomcolor' && typeof window.setSelectedColor === 'function') {
          // toggle random by setting tool or clear selectedColor
          if (window.VRCreatorState && window.VRCreatorState.selectedColor) {
            window.setSelectedColor(null);
          } else {
            // pick a random and set
            const hues = ['#FFCC00', '#EF2D5E', '#4CC3D9', '#7BC8A4', '#FF9F1C', '#9B5DE5'];
            window.setSelectedColor(hues[Math.floor(Math.random() * hues.length)]);
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

  // Initialize default multi-tool tablet UI (call on load) - expanded with new features
  window.initTabletUI = function() {
    return window.safeExecute(() => {
      const tablet = getTablet();
      if (!tablet) return;

      // Clear existing dynamic children (buttons)
      const existingButtons = tablet.querySelectorAll('[spawn-button], [id^="btn-"], [id^="action-"]');
      existingButtons.forEach(el => el.parentNode && el.parentNode.removeChild(el));

      // Row 1: 5 spawn tools (more primitives) - tighter spacing for consistent design
      const tools = [
        { type: 'cube', color: '#FFCC00', label: 'C', x: -0.32 },
        { type: 'sphere', color: '#EF2D5E', label: 'S', x: -0.16 },
        { type: 'cylinder', color: '#4CC3D9', label: 'Y', x: 0 },
        { type: 'cone', color: '#7BC8A4', label: 'N', x: 0.16 },
        { type: 'torus', color: '#9B5DE5', label: 'T', x: 0.32 }
      ];

      tools.forEach((tool) => {
        window.addSpawnButtonToTablet({
          id: `btn-${tool.type}`,
          type: tool.type,
          color: tool.color,
          label: tool.label,
          position: { x: tool.x, y: 0.08 }
        });
      });

      // Row 2: Action buttons - Undo, Clear, Color
      window.addActionButtonToTablet({
        id: 'action-undo',
        action: 'undo',
        label: 'UNDO',
        color: '#FF6B6B',
        position: { x: -0.25, y: -0.1 }
      });
      window.addActionButtonToTablet({
        id: 'action-clear',
        action: 'clear',
        label: 'CLEAR',
        color: '#FF9F1C',
        position: { x: 0, y: -0.1 }
      });
      window.addActionButtonToTablet({
        id: 'action-color',
        action: 'randomcolor',
        label: 'COLOR',
        color: '#00F5D4',
        position: { x: 0.25, y: -0.1 }
      });

      // Update title and initial stats from state
      const state = window.VRCreatorState || {};
      window.updateTabletUI(
        'VR Object Creator', 
        `Spawned: ${state.spawnedCount || 0} | Tool: ${state.selectedTool || 'cube'}`
      );

      // Listen for state changes to auto-update stats (reactive)
      // Remove previous listener if re-init to avoid dupes (simple flag)
      if (!window._tabletStateListener) {
        document.addEventListener('vr-state-changed', (e) => {
          const s = e.detail.current || window.VRCreatorState;
          if (s) {
            const colorInfo = s.selectedColor ? ` | C:${s.selectedColor.slice(0,7)}` : '';
            window.updateTabletUI('VR Object Creator', `Spawned: ${s.spawnedCount || 0} | Tool: ${s.selectedTool || 'cube'}${colorInfo}`);
          }
        });
        window._tabletStateListener = true;
      }

      console.log('✅ Tablet UI initialized with 5 primitives + UNDO/CLEAR/COLOR actions + reactive stats.');
    }, 'Init Tablet UI');
  };

  console.log('✅ Tablet UI Hook loaded - dynamic, intelligent 3D interface ready (expanded features).');
})();
