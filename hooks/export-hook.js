/**
 * Export Hook for Quest VR Creator
 * Provides GLB/GLTF export of scene objects for use in Unity, online apps, etc.
 * Uses Three.js GLTFExporter (bundled with A-Frame's THREE).
 */
(function() {
  'use strict';

  // Load GLTFExporter from CDN since A-Frame doesn't bundle it
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/three@0.169.0/examples/js/exporters/GLTFExporter.js';
  script.onload = function() {
    console.log('✅ GLTFExporter loaded for asset export.');
  };
  script.onerror = function() {
    // Fallback: define a minimal exporter using Three.js internals
    console.warn('GLTFExporter CDN failed, using inline fallback.');
    defineInlineExporter();
  };
  document.head.appendChild(script);

  function defineInlineExporter() {
    // Minimal GLB export using Three.js BufferGeometry serialization
    if (!window.THREE) return;
    window.THREE.GLTFExporter = class {
      parse(scene, onDone, onError, options) {
        // Minimal: export as JSON glTF
        try {
          const json = scene.toJSON();
          const str = JSON.stringify(json);
          const blob = new Blob([str], { type: 'application/json' });
          onDone(blob);
        } catch (e) {
          if (onError) onError(e);
        }
      }
    };
  }

  /**
   * Export all spawned objects (or entire scene) as GLB file
   * @param {object} options - { binary: true, fileName: 'scene.glb', onlySpawned: true }
   */
  window.exportSceneGLB = function(options = {}) {
    return window.safeExecute(() => {
      const scene = document.querySelector('a-scene');
      if (!scene || !scene.object3D) {
        console.error('Export failed: no scene');
        return;
      }

      const binary = options.binary !== false;
      const fileName = options.fileName || (binary ? 'scene.glb' : 'scene.gltf');
      const onlySpawned = options.onlySpawned !== false;

      // Collect meshes to export
      const exportScene = new THREE.Scene();

      if (onlySpawned) {
        const spawned = document.querySelectorAll('.spawned-object');
        spawned.forEach(el => {
          if (el.object3D) {
            const clone = el.object3D.clone(true);
            exportScene.add(clone);
          }
        });
        if (exportScene.children.length === 0) {
          console.warn('No spawned objects to export. Create some objects first.');
          alert('No objects to export. Create some objects first!');
          return;
        }
      } else {
        // Export visible meshes excluding ground, sky, lights, camera
        scene.object3D.traverse(child => {
          if (child.isMesh && !child.el?.id?.match(/^(ground|sky|camera|player|tablet)/)) {
            exportScene.add(child.clone());
          }
        });
      }

      const exporter = new THREE.GLTFExporter();
      exporter.parse(exportScene, function(result) {
        let blob;
        if (result instanceof ArrayBuffer) {
          blob = new Blob([result], { type: 'application/octet-stream' });
        } else {
          const str = JSON.stringify(result, null, 2);
          blob = new Blob([str], { type: 'application/json' });
        }

        // Trigger download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          URL.revokeObjectURL(url);
          a.remove();
        }, 1000);

        console.log(`✅ Exported ${fileName} (${(blob.size / 1024).toFixed(1)} KB)`);
      }, function(error) {
        console.error('Export error:', error);
      }, { binary: binary });
    }, 'Export Scene GLB');
  };

  /**
   * Export selected object only
   */
  window.exportSelectedGLB = function() {
    return window.safeExecute(() => {
      const selected = window.VRCreatorState && window.VRCreatorState.selectedObject;
      if (!selected || !selected.object3D) {
        console.warn('No object selected for export.');
        alert('Select an object first (click it), then export.');
        return;
      }
      const exportScene = new THREE.Scene();
      exportScene.add(selected.object3D.clone(true));

      const exporter = new THREE.GLTFExporter();
      exporter.parse(exportScene, function(result) {
        const blob = result instanceof ArrayBuffer
          ? new Blob([result], { type: 'application/octet-stream' })
          : new Blob([JSON.stringify(result)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'object.glb';
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000);
        console.log('✅ Exported selected object as GLB');
      }, function(err) { console.error('Export error:', err); }, { binary: true });
    }, 'Export Selected GLB');
  };

  console.log('✅ Export Hook loaded - GLB/GLTF export ready for Unity & web apps.');
})();
