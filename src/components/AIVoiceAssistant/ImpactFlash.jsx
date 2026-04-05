import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * ImpactFlash - Brief white flash overlay for click "hit" feedback
 * 
 * Animation timeline (200ms total):
 * - 0-30ms: Fast fade-in (opacity 0 -> 0.4)
 * - 30-200ms: Fade-out (opacity 0.4 -> 0)
 * 
 * Uses additive blending for subtle glow effect without being distracting.
 */
export default function ImpactFlash({ isActive = false }) {
  const meshRef = useRef();

  const flashState = useRef({
    active: false,
    timer: 0,
    duration: 0.2, // 200ms total flash duration
  });

  // Slightly larger than sphere (radius 1.02) to avoid z-fighting
  const geometry = useMemo(() => new THREE.SphereGeometry(1.02, 64, 64), []);

  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#ffffff',
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.FrontSide,
      }),
    []
  );

  // Cleanup geometry and material on unmount
  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  // Track previous isActive value to detect rising edge
  const prevActive = useRef(isActive);

  useFrame((_, delta) => {
    const fs = flashState.current;
    const mesh = meshRef.current;
    if (!mesh) return;

    // Detect flash trigger (rising edge)
    if (isActive && !prevActive.current) {
      fs.active = true;
      fs.timer = 0;
      mesh.visible = true;
    }
    prevActive.current = isActive;

    // Update flash timer if active
    if (fs.active) {
      fs.timer += delta;
      const t = fs.timer / fs.duration;
      const fadeInEnd = 0.15;

      if (t >= 1.0) {
        fs.active = false;
        fs.timer = 0;
        mesh.material.opacity = 0;
        mesh.visible = false;
      } else if (t < fadeInEnd) {
        mesh.material.opacity = (t / fadeInEnd) * 0.4;
      } else {
        mesh.material.opacity = 0.4 * (1.0 - (t - fadeInEnd) / (1.0 - fadeInEnd));
      }
    }
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      visible={false}
      renderOrder={2} // Above sphere (1), below eyes (10)
    />
  );
}
