import { useRef, useMemo, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const MAX_RINGS = 6;

// Radar/sonar pulse rings that emit on blink
export default function RippleRings({ blinkTrigger }) {
  const ringsRef = useRef([]);
  const ringData = useRef(
    Array.from({ length: MAX_RINGS }, () => ({
      active: false,
      age: 0,
      maxAge: 2.0,
    }))
  );
  const lastTrigger = useRef(0);

  // Trigger a new ring
  const triggerRing = useCallback(() => {
    const data = ringData.current;
    for (let i = 0; i < MAX_RINGS; i++) {
      if (!data[i].active) {
        data[i].active = true;
        data[i].age = 0;
        data[i].maxAge = 1.8 + Math.random() * 0.4;
        break;
      }
    }
  }, []);

  // Watch for blink trigger changes
  useFrame((_, delta) => {
    if (blinkTrigger > lastTrigger.current) {
      lastTrigger.current = blinkTrigger;
      // Emit 2-3 rings per blink for radar effect
      triggerRing();
      setTimeout(() => triggerRing(), 120);
    }

    const data = ringData.current;

    for (let i = 0; i < MAX_RINGS; i++) {
      const mesh = ringsRef.current[i];
      if (!mesh) continue;

      if (!data[i].active) {
        mesh.visible = false;
        continue;
      }

      data[i].age += delta;
      const progress = data[i].age / data[i].maxAge;

      if (progress >= 1.0) {
        data[i].active = false;
        mesh.visible = false;
        continue;
      }

      mesh.visible = true;

      // Scale: expand from sphere radius outward
      const scale = 1.1 + progress * 3.5;
      mesh.scale.set(scale, scale, scale);

      // Opacity: fade in quickly, fade out slowly
      const fadeIn = Math.min(progress / 0.1, 1.0);
      const fadeOut = 1.0 - Math.pow(progress, 0.6);
      mesh.material.opacity = fadeIn * fadeOut * 0.3;
    }
  });

  const geometry = useMemo(() => new THREE.RingGeometry(0.98, 1.0, 128), []);

  return (
    <group>
      {Array.from({ length: MAX_RINGS }, (_, i) => (
        <mesh
          key={i}
          ref={(el) => { ringsRef.current[i] = el; }}
          geometry={geometry}
          visible={false}
          renderOrder={5}
        >
          <meshBasicMaterial
            color="#88ccff"
            transparent
            opacity={0}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}
