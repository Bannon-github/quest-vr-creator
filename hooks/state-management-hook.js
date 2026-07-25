/**
 * State Management Hook for Quest VR Creator
 * Purpose: Centralized, intelligent app state for tracking tools, spawned objects, UI, user actions, colors.
 * Enables features like undo, clear all, stats, persistence (future localStorage), tool switching, selectedColor.
 * Less errors: validated updates, change events for reactive UI.
 * More intelligence: queryable history, counts, easy extension for new primitives and actions.
 * Tested: Syntax valid.
 */

(function() {
  'use strict';

  // Initialize or enhance global state
  if (!window.VRCreatorState) {
    window.VRCreatorState = {
      selectedTool: 'cube',
      selectedColor: null, // null = use type default or random
      spawnedCount: 0,
      lastSpawnPos: null,
      spawnedObjects: [], // array of {id, type, pos, color, timestamp}
      tools: ['cube', 'sphere', 'cylinder', 'cone', 'torus'], // extensible - more primitives
      ui: {
        tabletVisible: true,
        lastInteraction: null
      },
      sessionStart: Date.now()
    };
    console.log('✅ VRCreatorState initialized via hook (with cone/torus + color support).');
  } else {
    // Ensure new fields exist if state was partial
    if (!window.VRCreatorState.tools || !window.VRCreatorState.tools.includes('cone')) {
      window.VRCreatorState.tools = ['cube', 'sphere', 'cylinder', 'cone', 'torus'];
    }
    if (window.VRCreatorState.selectedColor === undefined) {
      window.VRCreatorState.selectedColor = null;
    }
  }

  // Intelligent state updater with validation and event dispatch (for reactive components)
  window.updateVRState = function(updates) {
    if (!window.VRCreatorState || typeof updates !== 'object') {
      console.warn('State update skipped: invalid input');
      return false;
    }
    try {
      const prevState = JSON.parse(JSON.stringify(window.VRCreatorState)); // shallow snapshot
      Object.assign(window.VRCreatorState, updates);
      
      // Emit custom event for any listeners (e.g. UI updates on tablet)
      const event = new CustomEvent('vr-state-changed', { 
        detail: { updates, previous: prevState, current: window.VRCreatorState } 
      });
      document.dispatchEvent(event);
      
      console.log('✅ VR State updated intelligently:', Object.keys(updates).join(', '));
      return true;
    } catch (e) {
      console.error('State update error (mitigated):', e);
      return false;
    }
  };

  // Example: tool change
  window.selectTool = function(newTool) {
    if (window.VRCreatorState.tools.includes(newTool) || newTool === 'random') {
      window.updateVRState({ selectedTool: newTool });
      console.log(`🛠️ Tool selected: ${newTool}`);
    } else {
      console.warn(`Tool '${newTool}' not available. Available:`, window.VRCreatorState.tools);
    }
  };

  // Set selected color for next spawns (or null for defaults)
  window.setSelectedColor = function(hexColor) {
    window.updateVRState({ selectedColor: hexColor || null });
    console.log(`🎨 Selected color set: ${hexColor || 'default/type-based'}`);
  };

  // Undo last spawn using history (improved reliable by id)
  window.undoLastSpawn = function() {
    return window.safeExecute(() => {
      const state = window.VRCreatorState;
      if (state.spawnedObjects && state.spawnedObjects.length > 0) {
        const last = state.spawnedObjects.pop();
        const el = document.getElementById(last.id);
        if (el && el.parentNode) {
          el.parentNode.removeChild(el);
          state.spawnedCount = Math.max(0, state.spawnedCount - 1);
          console.log('↩️ Undid last spawn:', last.type, last.id);
          window.updateVRState({ spawnedCount: state.spawnedCount });
          return true;
        } else {
          // Fallback cleanup if id lost
          console.warn('Undo: element not found by id, history cleaned');
          state.spawnedCount = Math.max(0, state.spawnedCount - 1);
          window.updateVRState({ spawnedCount: state.spawnedCount });
        }
      } else {
        console.log('Nothing to undo.');
      }
      return false;
    }, 'Undo Last Spawn', false);
  };

  // Clear all spawned objects (new feature)
  window.clearAllSpawned = function() {
    return window.safeExecute(() => {
      const state = window.VRCreatorState;
      const objs = document.querySelectorAll('.spawned-object');
      let removed = 0;
      objs.forEach(el => {
        if (el.parentNode) {
          el.parentNode.removeChild(el);
          removed++;
        }
      });
      state.spawnedObjects = [];
      state.spawnedCount = 0;
      window.updateVRState({ spawnedCount: 0, spawnedObjects: [] });
      console.log(`🗑️ Cleared ${removed} spawned objects.`);
      return removed;
    }, 'Clear All Spawned', 0);
  };

  console.log('✅ State Management Hook active - intelligence layer for VR Creator ready (undo + clearAll + more tools + color).');
})();
