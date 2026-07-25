/**
 * Scene Operations Hook for Quest VR Creator
 * Provides delete, duplicate, clear, and extended primitive spawning.
 */
(function() {
  'use strict';

  // Extend available tools
  if (window.VRCreatorState) {
    window.VRCreatorState.tools = ['cube', 'sphere', 'cylinder', 'cone', 'torus', 'plane'];
  }

  // Delete selected object
  window.deleteSelected = function() {
    return window.safeExecute(() => {
      const selected = window.VRCreatorState && window.VRCreatorState.selectedObject;
      if (!selected) {
        console.warn('Nothing selected to delete.');
        return false;
      }
      const id = selected.id || 'unknown';
      selected.parentNode && selected.parentNode.removeChild(selected);
      window.VRCreatorState.selectedObject = null;

      // Remove from history
      if (window.VRCreatorState.spawnedObjects) {
        window.VRCreatorState.spawnedObjects = window.VRCreatorState.spawnedObjects.filter(o => o.id !== id);
        window.VRCreatorState.spawnedCount = Math.max(0, window.VRCreatorState.spawnedCount - 1);
      }
      window.updateVRState({});
      console.log('🗑️ Deleted:', id);
      return true;
    }, 'Delete Selected');
  };

  // Duplicate selected object
  window.duplicateSelected = function() {
    return window.safeExecute(() => {
      const selected = window.VRCreatorState && window.VRCreatorState.selectedObject;
      if (!selected) {
        console.warn('Nothing selected to duplicate.');
        return null;
      }
      const pos = selected.getAttribute('position');
      const geom = selected.getAttribute('geometry');
      const mat = selected.getAttribute('material');
      const rot = selected.getAttribute('rotation');
      const scl = selected.getAttribute('scale');

      const clone = document.createElement('a-entity');
      clone.setAttribute('class', 'raycaster-target spawned-object');
      clone.setAttribute('position', { x: pos.x + 0.5, y: pos.y, z: pos.z });
      if (geom) clone.setAttribute('geometry', geom);
      if (mat) clone.setAttribute('material', mat);
      if (rot) clone.setAttribute('rotation', rot);
      if (scl) clone.setAttribute('scale', scl);
      clone.setAttribute('dynamic-body', selected.getAttribute('dynamic-body') || 'shape: box');

      const scene = document.querySelector('a-scene');
      scene.appendChild(clone);

      if (window.VRCreatorState) {
        window.VRCreatorState.spawnedCount++;
        window.VRCreatorState.spawnedObjects.push({ id: clone.id || `dup-${Date.now()}`, type: 'duplicate', pos: `${pos.x + 0.5} ${pos.y} ${pos.z}` });
        window.updateVRState({});
      }
      console.log('📋 Duplicated object');
      return clone;
    }, 'Duplicate Selected');
  };

  // Clear all spawned objects
  window.clearScene = function() {
    return window.safeExecute(() => {
      const spawned = document.querySelectorAll('.spawned-object');
      spawned.forEach(el => el.parentNode && el.parentNode.removeChild(el));
      if (window.VRCreatorState) {
        window.VRCreatorState.spawnedObjects = [];
        window.VRCreatorState.spawnedCount = 0;
        window.VRCreatorState.selectedObject = null;
        window.updateVRState({});
      }
      console.log('🧹 Scene cleared');
    }, 'Clear Scene');
  };

  // Extended spawn for new primitives (cone, torus, plane)
  const origSpawn = window.spawnIntelligentObject;
  window.spawnIntelligentObject = function(type = 'cube', options = {}) {
    // Handle extended types before falling through
    if (['cone', 'torus', 'plane'].includes(type.toLowerCase())) {
      return window.safeExecute(() => {
        const scene = document.querySelector('a-scene');
        if (!scene) return null;

        const camera = document.querySelector('#camera');
        let spawnPos = options.positionOverride || '0 1.5 -2';

        if (camera && camera.object3D && !options.positionOverride) {
          try {
            const camPos = camera.object3D.position;
            const camQuat = camera.object3D.quaternion;
            const camDir = new THREE.Vector3(0, 0, -1).applyQuaternion(camQuat);
            const offset = camDir.multiplyScalar(1.8);
            const posX = (camPos.x + offset.x).toFixed(2);
            const posY = Math.max(0.5, (camPos.y + 0.3)).toFixed(2);
            const posZ = (camPos.z + offset.z).toFixed(2);
            spawnPos = `${posX} ${posY} ${posZ}`;
          } catch (e) { /* fallback */ }
        }

        const newObj = document.createElement('a-entity');
        newObj.setAttribute('class', 'raycaster-target spawned-object');
        newObj.setAttribute('position', spawnPos);

        let geometry, materialColor;
        switch (type.toLowerCase()) {
          case 'cone':
            geometry = 'primitive: cone; radiusBottom: 0.4; radiusTop: 0; height: 0.8';
            materialColor = options.color || '#FF8C00';
            newObj.setAttribute('dynamic-body', 'shape: box');
            break;
          case 'torus':
            geometry = 'primitive: torus; radius: 0.3; radiusTubular: 0.08';
            materialColor = options.color || '#9B59B6';
            newObj.setAttribute('dynamic-body', 'shape: box');
            break;
          case 'plane':
            geometry = 'primitive: plane; width: 0.8; height: 0.8';
            materialColor = options.color || '#27AE60';
            newObj.setAttribute('dynamic-body', 'shape: box');
            newObj.setAttribute('material', `color: ${materialColor}; side: double; metalness: 0.1; roughness: 0.9`);
            scene.appendChild(newObj);
            newObj.setAttribute('geometry', geometry);
            if (window.VRCreatorState) {
              window.VRCreatorState.spawnedCount++;
              window.VRCreatorState.spawnedObjects.push({ id: `obj-${Date.now()}`, type, pos: spawnPos });
              window.updateVRState({});
            }
            return newObj;
        }

        newObj.setAttribute('geometry', geometry);
        newObj.setAttribute('material', `color: ${materialColor}; metalness: 0.2; roughness: 0.8`);
        scene.appendChild(newObj);

        if (window.VRCreatorState) {
          window.VRCreatorState.spawnedCount++;
          window.VRCreatorState.spawnedObjects.push({ id: `obj-${Date.now()}`, type, pos: spawnPos });
          window.updateVRState({});
        }
        console.log(`✅ Spawned ${type} at ${spawnPos}`);
        return newObj;
      }, 'Spawn Extended Primitive');
    }
    // Fallback to original for cube/sphere/cylinder
    return origSpawn ? origSpawn(type, options) : null;
  };

  // Color change on selected
  window.setObjectColor = function(color) {
    return window.safeExecute(() => {
      const selected = window.VRCreatorState && window.VRCreatorState.selectedObject;
      if (!selected) {
        console.warn('Select an object first to change color.');
        return;
      }
      selected.setAttribute('material', 'color', color);
      console.log(`🎨 Color set to ${color}`);
    }, 'Set Object Color');
  };

  console.log('✅ Scene Operations Hook loaded - delete, duplicate, clear, extended primitives, color.');
})();
