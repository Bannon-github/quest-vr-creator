/**
 * Desktop Controls Hook for Quest VR Creator
 * Provides mouse/keyboard interaction for non-VR usage (GitHub Pages on desktop browser).
 * - Click to select objects
 * - Keyboard shortcuts for tools and actions
 * - Orbit camera when not in VR
 */
(function() {
  'use strict';

  let selectedEl = null;
  let transformMode = 'translate'; // translate, rotate, scale

  // Selection via mouse click (raycaster)
  function initDesktopSelection() {
    const scene = document.querySelector('a-scene');
    if (!scene) return;

    // Wait for scene to load
    scene.addEventListener('loaded', () => {
      const canvas = scene.canvas;
      if (!canvas) return;

      canvas.addEventListener('click', (evt) => {
        // Don't interfere in VR mode
        if (scene.is('vr-mode')) return;

        const camera = document.querySelector('#camera');
        if (!camera || !camera.components.camera) return;

        const rect = canvas.getBoundingClientRect();
        const mouse = new THREE.Vector2(
          ((evt.clientX - rect.left) / rect.width) * 2 - 1,
          -((evt.clientY - rect.top) / rect.height) * 2 + 1
        );

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera.components.camera.camera);

        const targets = document.querySelectorAll('.raycaster-target');
        const meshes = [];
        targets.forEach(el => {
          if (el.object3D) {
            el.object3D.traverse(child => {
              if (child.isMesh) {
                child.el = el;
                meshes.push(child);
              }
            });
          }
        });

        const intersects = raycaster.intersectObjects(meshes, false);
        if (intersects.length > 0) {
          const hitEl = intersects[0].object.el;
          if (hitEl && hitEl.id !== 'ground') {
            selectObject(hitEl);
          } else {
            deselectObject();
          }
        } else {
          deselectObject();
        }
      });
    });
  }

  function selectObject(el) {
    deselectObject();
    selectedEl = el;
    // Visual feedback - add outline effect via emissive
    if (el.getAttribute('material')) {
      el.setAttribute('data-orig-emissive', el.getAttribute('material').emissive || '#000000');
      el.setAttribute('material', 'emissive', '#444444');
    }
    if (window.VRCreatorState) {
      window.VRCreatorState.selectedObject = el;
      window.updateVRState({ selectedObject: el });
    }
    console.log('Selected:', el.id || el.tagName);
  }

  function deselectObject() {
    if (selectedEl) {
      const orig = selectedEl.getAttribute('data-orig-emissive') || '#000000';
      if (selectedEl.getAttribute('material')) {
        selectedEl.setAttribute('material', 'emissive', orig);
      }
      selectedEl = null;
    }
    if (window.VRCreatorState) {
      window.VRCreatorState.selectedObject = null;
    }
  }

  // Keyboard shortcuts
  function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      const scene = document.querySelector('a-scene');
      if (scene && scene.is('vr-mode')) return;
      // Don't capture if typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      switch (e.key.toLowerCase()) {
        case '1': window.selectTool && window.selectTool('cube'); break;
        case '2': window.selectTool && window.selectTool('sphere'); break;
        case '3': window.selectTool && window.selectTool('cylinder'); break;
        case '4': window.selectTool && window.selectTool('cone'); break;
        case '5': window.selectTool && window.selectTool('torus'); break;
        case '6': window.selectTool && window.selectTool('plane'); break;
        case 'n': // Spawn current tool
          if (window.spawnIntelligentObject && window.VRCreatorState) {
            window.spawnIntelligentObject(window.VRCreatorState.selectedTool);
          }
          break;
        case 'delete':
        case 'backspace':
          if (selectedEl && window.deleteSelected) window.deleteSelected();
          break;
        case 'd':
          if (e.ctrlKey || e.metaKey) { e.preventDefault(); window.duplicateSelected && window.duplicateSelected(); }
          break;
        case 'z':
          if (e.ctrlKey || e.metaKey) { e.preventDefault(); window.undoLastSpawn && window.undoLastSpawn(); }
          break;
        case 'e':
          window.exportSceneGLB && window.exportSceneGLB();
          break;
        case 'g': transformMode = 'translate'; console.log('Mode: Translate'); break;
        case 'r': if (!e.ctrlKey) { transformMode = 'rotate'; console.log('Mode: Rotate'); } break;
        case 's': if (!e.ctrlKey) { transformMode = 'scale'; console.log('Mode: Scale'); } break;
      }
    });
  }

  // Arrow key transform for selected object
  function initArrowTransform() {
    document.addEventListener('keydown', (e) => {
      if (!selectedEl) return;
      const scene = document.querySelector('a-scene');
      if (scene && scene.is('vr-mode')) return;

      const step = e.shiftKey ? 0.5 : 0.1;
      const pos = selectedEl.getAttribute('position');
      const rot = selectedEl.getAttribute('rotation');
      const scl = selectedEl.getAttribute('scale') || { x: 1, y: 1, z: 1 };

      if (transformMode === 'translate') {
        switch (e.key) {
          case 'ArrowUp': selectedEl.setAttribute('position', { x: pos.x, y: pos.y, z: pos.z - step }); break;
          case 'ArrowDown': selectedEl.setAttribute('position', { x: pos.x, y: pos.y, z: pos.z + step }); break;
          case 'ArrowLeft': selectedEl.setAttribute('position', { x: pos.x - step, y: pos.y, z: pos.z }); break;
          case 'ArrowRight': selectedEl.setAttribute('position', { x: pos.x + step, y: pos.y, z: pos.z }); break;
          case 'PageUp': selectedEl.setAttribute('position', { x: pos.x, y: pos.y + step, z: pos.z }); break;
          case 'PageDown': selectedEl.setAttribute('position', { x: pos.x, y: pos.y - step, z: pos.z }); break;
        }
      } else if (transformMode === 'rotate') {
        const rStep = e.shiftKey ? 45 : 15;
        switch (e.key) {
          case 'ArrowUp': selectedEl.setAttribute('rotation', { x: rot.x + rStep, y: rot.y, z: rot.z }); break;
          case 'ArrowDown': selectedEl.setAttribute('rotation', { x: rot.x - rStep, y: rot.y, z: rot.z }); break;
          case 'ArrowLeft': selectedEl.setAttribute('rotation', { x: rot.x, y: rot.y + rStep, z: rot.z }); break;
          case 'ArrowRight': selectedEl.setAttribute('rotation', { x: rot.x, y: rot.y - rStep, z: rot.z }); break;
        }
      } else if (transformMode === 'scale') {
        const sStep = e.shiftKey ? 0.5 : 0.1;
        switch (e.key) {
          case 'ArrowUp': selectedEl.setAttribute('scale', { x: scl.x + sStep, y: scl.y + sStep, z: scl.z + sStep }); break;
          case 'ArrowDown': selectedEl.setAttribute('scale', { x: Math.max(0.1, scl.x - sStep), y: Math.max(0.1, scl.y - sStep), z: Math.max(0.1, scl.z - sStep) }); break;
          case 'ArrowRight': selectedEl.setAttribute('scale', { x: scl.x + sStep, y: scl.y, z: scl.z }); break;
          case 'ArrowLeft': selectedEl.setAttribute('scale', { x: Math.max(0.1, scl.x - sStep), y: scl.y, z: scl.z }); break;
        }
      }
    });
  }

  // Expose for other hooks
  window.selectObject = selectObject;
  window.deselectObject = deselectObject;
  window.getTransformMode = () => transformMode;
  window.setTransformMode = (m) => { transformMode = m; };

  // Init on load
  window.addEventListener('load', () => {
    initDesktopSelection();
    initKeyboardShortcuts();
    initArrowTransform();
    console.log('✅ Desktop Controls active. Keys: 1-6=tools, N=spawn, Del=delete, G/R/S=transform mode, Arrows=move, E=export');
  });

  console.log('✅ Desktop Controls Hook loaded.');
})();
