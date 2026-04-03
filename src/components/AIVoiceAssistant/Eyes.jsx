import { useRef, useMemo, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Rounded rectangle shape for pill-like eyes
function createRoundedRectShape(width, height, radius) {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);
  return shape;
}

export default function Eyes({ onBlink }) {
  const leftRef = useRef();
  const rightRef = useRef();

  const blink = useRef({
    nextBlink: 2 + Math.random() * 4,
    blinking: false,
    timer: 0,
    duration: 0.12,
    fired: false,
  });

  const geometry = useMemo(() => {
    const shape = createRoundedRectShape(0.15, 0.30, 0.075);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.06,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 8,
    });
    geo.center();
    return geo;
  }, []);

  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#ffffff',
      }),
    []
  );

  useFrame((_, delta) => {
    const bs = blink.current;
    bs.nextBlink -= delta;

    if (bs.nextBlink <= 0 && !bs.blinking) {
      bs.blinking = true;
      bs.timer = 0;
      bs.fired = false;
    }

    let scaleY = 1;

    if (bs.blinking) {
      bs.timer += delta;
      const progress = bs.timer / bs.duration;

      if (progress < 0.5) {
        scaleY = 1.0 - progress * 2.0 * 0.9;
      } else {
        scaleY = 0.1 + (progress - 0.5) * 2.0 * 0.9;
      }
      scaleY = Math.max(0.1, Math.min(1.0, scaleY));

      // Fire blink event at the peak (eyes closed)
      if (progress >= 0.45 && !bs.fired) {
        bs.fired = true;
        if (onBlink) onBlink();
      }

      if (progress >= 1.0) {
        bs.blinking = false;
        bs.nextBlink = Math.random() < 0.3 ? 0.2 : 2 + Math.random() * 5;
        scaleY = 1;
      }
    }

    if (leftRef.current) leftRef.current.scale.set(1, scaleY, 1);
    if (rightRef.current) rightRef.current.scale.set(1, scaleY, 1);
  });

  // Eyes positioned OUTSIDE the sphere surface (z=1.02 > sphere radius 1.0)
  // renderOrder ensures they draw on top of the transparent sphere
  return (
    <group>
      <mesh
        ref={leftRef}
        position={[-0.22, 0.0, 1.02]}
        geometry={geometry}
        material={material}
        renderOrder={10}
      />
      <mesh
        ref={rightRef}
        position={[0.22, 0.0, 1.02]}
        geometry={geometry}
        material={material}
        renderOrder={10}
      />
    </group>
  );
}
