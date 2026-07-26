/**
 * State Management Hook for Quest VR Creator
 * Purpose: Centralized, intelligent app state for tracking tools, spawned objects, UI, user actions, colors, materials, persistence.
 * Enables features like undo, clear all, stats, localStorage persist, material presets, export, tool switching, delete by id.
 * Less errors: validated updates, change events for reactive UI, safeExecute wrappers.
 * More intelligence: queryable history, counts, easy extension for new primitives and actions, material + persist.
 * Tested: Syntax valid.
 */

(function() {
  'use strict';

  // Initialize or enhance global state
  if (!window.VRCreatorState) {
    window.VRCreatorState = {
      selectedTool: 'cube',
      selectedColor: null, // null = use type default or random
      selectedMaterial: { metalness: 0.3, roughness: 0.7, opacity: 1.0 }, // default PBR
      materialPreset: 'standard',
      spawnedCount: 0,
      lastSpawnPos: null,
      spawnedObjects: [], // array of {id, type, pos, color, material, timestamp}
      tools: ['cube', 'sphere', 'cylinder', 'cone', 'torus'],
      materialPresets: {
        standard: { metalness: 0.3, roughness: 0.7, opacity: 1.0 },
        metal: { metalness: 0.9, roughness: 0.2, opacity: 1.0 },
        plastic: { metalness: 0.05, roughness: 0.4, opacity: 1.0 },
        matte: { metalness: 0.0, roughness: 0.95, opacity: 1.0 },
        glass: { metalness: 0.1, roughness: 0.05, opacity: 0.55 }
      },
      ui: {
        tabletVisible: true,
        lastInteraction: null,
        holographic: true
      },
      sessionStart: Date.now()
    };
    console.log('✅ VRCreatorState initialized via hook (with materials + persist + holographic support).');
  } else {
    // Ensure new fields exist if state was partial
    if (!window.VRCreatorState.tools || !window.VRCreatorState.tools.includes('cone')) {
      window.VRCreatorState.tools = ['cube', 'sphere', 'cylinder', 'cone', 'torus'];
    }
    if (window.VRCreatorState.selectedColor === undefined) {
      window.VRCreatorState.selectedColor = null;
    }
    if (!window.VRCreatorState.selectedMaterial) {
      window.VRCreatorState.selectedMaterial = { metalness: 0.3, roughness: 0.7, opacity: 1.0 };
    }
    if (!window.VRCreatorState.materialPresets) {
      window.VRCreatorState.materialPresets = {
        standard: { metalness: 0.3, roughness: 0.7, opacity: 1.0 },
        metal: { metalness: 0.9, roughness: 0.2, opacity: 1.0 },
        plastic: { metalness: 0.05, roughness: 0.4, opacity: 1.0 },
        matte: { metalness: 0.0, roughness: 0.95, opacity: 1.0 },
        glass: { metalness: 0.1, roughness: 0.05, opacity: 0.55 }
      };
    }
    if (window.VRCreatorState.materialPreset === undefined) {
      window.VRCreatorState.materialPreset = 'standard';
    }
  }

  // Intelligent state updater with validation and event dispatch (for reactive components)
  window.updateVRState = function(updates) {
    if (!window.VRCreatorState || typeof updates !== 'object') {
      console.warn('State update skipped: invalid input');
      return false;
    }
    try {
      const prevState = JSON.parse(JSON.stringify(window.VRCreatorState));
      Object.assign(window.VRCreatorState, updates);
      
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

  // Cycle or set material preset
  window.setMaterialPreset = function(presetName) {
    return window.safeExecute(() => {
      const state = window.VRCreatorState;
      const presets = state.materialPresets || {};
      let name = presetName;
      if (!name || !presets[name]) {
        // cycle through
        const keys = Object.keys(presets);
        const idx = keys.indexOf(state.materialPreset || 'standard');
        name = keys[(idx + 1) % keys.length];
      }
      const mat = presets[name];
      if (mat) {
        window.updateVRState({ 
          materialPreset: name, 
          selectedMaterial: { ...mat } 
        });
        console.log(`✨ Material preset set: ${name} (metal:${mat.metalness} rough:${mat.roughness} opac:${mat.opacity})`);
        return name;
      }
      return null;
    }, 'Set Material Preset', null);
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

  // Clear all spawned objects
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

  // Persist scene to localStorage
  window.saveSceneToStorage = function() {
    return window.safeExecute(() => {
      const state = window.VRCreatorState;
      const data = {
        version: 1,
        timestamp: Date.now(),
        spawnedObjects: state.spawnedObjects || [],
        selectedTool: state.selectedTool,
        selectedColor: state.selectedColor,
        materialPreset: state.materialPreset,
        selectedMaterial: state.selectedMaterial
      };
      localStorage.setItem('quest-vr-creator-scene', JSON.stringify(data));
      console.log(`💾 Scene saved to localStorage (${data.spawnedObjects.length} objects).`);
      return true;
    }, 'Save Scene to Storage', false);
  };

  // Load scene from localStorage and respawn
  window.loadSceneFromStorage = function() {
    return window.safeExecute(() => {
      const raw = localStorage.getItem('quest-vr-creator-scene');
      if (!raw) {
        console.log('No saved scene found in localStorage.');
        return false;
      }
      const data = JSON.parse(raw);
      if (!data || !Array.isArray(data.spawnedObjects)) {
        console.warn('Invalid saved scene data.');
        return false;
      }
      // Clear current
      window.clearAllSpawned();
      // Restore state
      window.updateVRState({
        selectedTool: data.selectedTool || 'cube',
        selectedColor: data.selectedColor || null,
        materialPreset: data.materialPreset || 'standard',
        selectedMaterial: data.selectedMaterial || { metalness: 0.3, roughness: 0.7, opacity: 1.0 }
      });
      // Respawn each
      data.spawnedObjects.forEach(obj => {
        if (typeof window.spawnIntelligentObject === 'function') {
          window.spawnIntelligentObject(obj.type, {
            color: obj.color,
            positionOverride: obj.pos,
            material: obj.material || data.selectedMaterial
          });
        }
      });
      console.log(`📂 Scene loaded from localStorage (${data.spawnedObjects.length} objects restored).`);
      return true;
    }, 'Load Scene from Storage', false);
  };

  // Export scene as JSON download (desktop friendly)
  window.exportSceneJSON = function() {
    return window.safeExecute(() => {
      const state = window.VRCreatorState;
      const data = {
        version: 1,
        exportedAt: new Date().toISOString(),
        spawnedCount: state.spawnedCount,
        objects: state.spawnedObjects || [],
        tool: state.selectedTool,
        color: state.selectedColor,
        material: state.selectedMaterial,
        preset: state.materialPreset
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quest-vr-scene-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      console.log('📤 Scene exported as JSON download.');
      return true;
    }, 'Export Scene JSON', false);
  };

  // Delete specific object by id or element (for gesture)
  window.deleteSpawnedObject = function(idOrEl) {
    return window.safeExecute(() => {
      const state = window.VRCreatorState;
      let el = typeof idOrEl === 'string' ? document.getElementById(idOrEl) : idOrEl;
      if (!el || !el.classList.contains('spawned-object')) {
        console.log('Delete: no valid spawned object.');
        return false;
      }
      const id = el.id;
      if (el.parentNode) el.parentNode.removeChild(el);
      // Clean history
      if (state.spawnedObjects) {
        state.spawnedObjects = state.spawnedObjects.filter(o => o.id !== id);
        state.spawnedCount = state.spawnedObjects.length;
        window.updateVRState({ spawnedCount: state.spawnedCount, spawnedObjects: state.spawnedObjects });
      }
      console.log('🗑️ Deleted object:', id);
      return true;
    }, 'Delete Spawned Object', false);
  };

  console.log('✅ State Management Hook active - intelligence layer ready (undo + clear + materials + persist + export + delete).');
})();
