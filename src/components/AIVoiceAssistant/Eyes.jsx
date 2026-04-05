import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Rounded rectangle shape for pill-like eyes (normal state)
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

// ">" chevron shape as a single closed polygon
function createAngledEyeShape(width, height, strokeWidth) {
  const shape = new THREE.Shape();
  const hw = width / 2;
  const hh = height / 2;
  const sw = strokeWidth;

  // Outer outline (clockwise)
  shape.moveTo(-hw, hh);            // top-left outer
  shape.lineTo(hw, sw * 0.4);       // top arm → tip outer-top
  shape.lineTo(hw, -sw * 0.4);      // tip outer-bottom
  shape.lineTo(-hw, -hh);           // bottom-left outer

  // Inner return (creates thickness)
  shape.lineTo(-hw, -hh + sw);      // bottom-left inner
  shape.lineTo(hw - sw * 1.5, 0);   // inner tip
  shape.lineTo(-hw, hh - sw);       // top-left inner

  shape.closePath();
  return shape;
}

export default function Eyes({ onBlink, isHit = false }) {
  const leftRef = useRef();
  const rightRef = useRef();
  const leftHitMeshRef = useRef();
  const rightHitMeshRef = useRef();

  const blink = useRef({
    nextBlink: 4,
    blinking: false,
    timer: 0,
    duration: 0.12,
    fired: false,
  });

  const hitState = useRef({
    active: false,
    timer: 0,
    duration: 0.4,
  });

  const transition = useRef({
    phase: 'idle',          // 'idle' | 'closing' | 'opening'
    timer: 0,
    closeDuration: 0.06,
    openDuration: 0.08,
    toHit: false,           // true = going normal→hit, false = hit→normal
    currentlyShowing: 'normal', // 'normal' | 'hit' — tracks what is actually visible
  });

  // Normal eye geometry (pill shape)
  const normalGeometry = useMemo(() => {
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

  // Hit eye geometry (angled ">" shape)
  const hitGeometry = useMemo(() => {
    const shape = createAngledEyeShape(0.18, 0.26, 0.055);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.06,
      bevelEnabled: true,
      bevelThickness: 0.015,
      bevelSize: 0.015,
      bevelSegments: 6,
    });
    geo.center();
    return geo;
  }, []);

  const material = useMemo(
    () => new THREE.MeshBasicMaterial({ color: '#ffffff' }),
    []
  );

  // Cleanup
  useEffect(() => {
    return () => {
      normalGeometry.dispose();
      hitGeometry.dispose();
      material.dispose();
    };
  }, [normalGeometry, hitGeometry, material]);

  const prevIsHit = useRef(isHit);

  useFrame((_, delta) => {
    const bs = blink.current;
    const hs = hitState.current;
    const tr = transition.current;

    const left = leftRef.current;
    const right = rightRef.current;
    const leftHit = leftHitMeshRef.current;
    const rightHit = rightHitMeshRef.current;

    // Detect rising/falling edge on isHit
    const risingEdge = isHit && !prevIsHit.current;
    const fallingEdge = !isHit && prevIsHit.current;
    prevIsHit.current = isHit;

    if (risingEdge) {
      // Always close whatever is currently showing, then open hit eyes
      tr.phase = 'closing';
      tr.toHit = true;
      tr.timer = 0;
    } else if (fallingEdge) {
      // Always close whatever is currently showing, then open normal eyes
      tr.phase = 'closing';
      tr.toHit = false;
      tr.timer = 0;
    }

    // Run transition
    if (tr.phase === 'closing') {
      tr.timer += delta;
      const progress = Math.min(tr.timer / tr.closeDuration, 1);
      const scaleY = 1 - progress;

      // Squeeze whichever set is currently on screen (not the destination)
      if (tr.currentlyShowing === 'normal') {
        if (left) left.scale.set(1, scaleY, 1);
        if (right) right.scale.set(1, scaleY, 1);
      } else {
        if (leftHit) leftHit.scale.set(1, scaleY, 1);
        if (rightHit) rightHit.scale.set(-1, scaleY, 1);
      }

      if (tr.timer >= tr.closeDuration) {
        // Hide current set, show incoming set at scaleY=0
        if (tr.toHit) {
          if (left) { left.visible = false; left.scale.set(1, 1, 1); }
          if (right) { right.visible = false; right.scale.set(1, 1, 1); }
          if (leftHit) { leftHit.visible = true; leftHit.scale.set(1, 0, 1); }
          if (rightHit) { rightHit.visible = true; rightHit.scale.set(-1, 0, 1); }
          hs.active = true;
          hs.timer = 0;
          tr.currentlyShowing = 'hit';
        } else {
          if (leftHit) { leftHit.visible = false; leftHit.scale.set(1, 1, 1); }
          if (rightHit) { rightHit.visible = false; rightHit.scale.set(-1, 1, 1); }
          if (left) { left.visible = true; left.scale.set(1, 0, 1); }
          if (right) { right.visible = true; right.scale.set(1, 0, 1); }
          hs.active = false;
          hs.timer = 0;
          tr.currentlyShowing = 'normal';
        }
        tr.phase = 'opening';
        tr.timer = 0;
      }
    } else if (tr.phase === 'opening') {
      tr.timer += delta;
      const progress = Math.min(tr.timer / tr.openDuration, 1);

      if (tr.toHit) {
        if (leftHit) leftHit.scale.set(1, progress, 1);
        if (rightHit) rightHit.scale.set(-1, progress, 1);
      } else {
        if (left) left.scale.set(1, progress, 1);
        if (right) right.scale.set(1, progress, 1);
      }

      if (tr.timer >= tr.openDuration) {
        if (tr.toHit) {
          if (leftHit) leftHit.scale.set(1, 1, 1);
          if (rightHit) rightHit.scale.set(-1, 1, 1);
        } else {
          if (left) left.scale.set(1, 1, 1);
          if (right) right.scale.set(1, 1, 1);
        }
        tr.phase = 'idle';
      }
    } else {
      // tr.phase === 'idle'

      if (hs.active) {
        // Advance hit timer only when fully visible
        hs.timer += delta;
        if (hs.timer >= hs.duration) {
          hs.timer = hs.duration; // clamp; falling edge from isHit will trigger transition
        }

        // Squash-stretch hit animation
        const t = hs.timer / hs.duration;
        let scaleX, scaleY;

        if (t < 0.15) {
          const p = t / 0.15;
          scaleX = 1.0 + p * 0.15;
          scaleY = 1.0 - p * 0.15;
        } else if (t < 0.30) {
          const p = (t - 0.15) / 0.15;
          scaleX = 1.15 + p * 0.10;
          scaleY = 0.85 - p * 0.10;
        } else if (t < 0.50) {
          scaleX = 1.25;
          scaleY = 0.75;
        } else {
          const p = (t - 0.50) / 0.50;
          const elasticX = 1 - Math.pow(2, -10 * p) * Math.cos((p * 10 - 0.75) * ((2 * Math.PI) / 3));
          const elasticY = 1 - Math.pow(2, -8 * p) * Math.cos((p * 8 - 0.5) * ((2 * Math.PI) / 3));
          scaleX = 1.25 + (1.0 - 1.25) * elasticX;
          scaleY = 0.75 + (1.0 - 0.75) * elasticY;
        }

        if (leftHit) leftHit.scale.set(scaleX, scaleY, 1);
        if (rightHit) rightHit.scale.set(-scaleX, scaleY, 1);
      } else {
        // Normal blink animation
        let scaleY = 1;

        bs.nextBlink -= delta;

        if (bs.nextBlink <= 0 && !bs.blinking) {
          bs.blinking = true;
          bs.timer = 0;
          bs.fired = false;
        }

        if (bs.blinking) {
          bs.timer += delta;
          const progress = bs.timer / bs.duration;

          if (progress < 0.5) {
            scaleY = 1.0 - progress * 2.0 * 0.9;
          } else {
            scaleY = 0.1 + (progress - 0.5) * 2.0 * 0.9;
          }
          scaleY = Math.max(0.1, Math.min(1.0, scaleY));

          if (progress >= 0.45 && !bs.fired) {
            bs.fired = true;
            if (onBlink) onBlink();
          }

          if (progress >= 1.0) {
            bs.blinking = false;
            bs.nextBlink = 2;
            scaleY = 1;
          }
        }

        if (left) left.scale.set(1, scaleY, 1);
        if (right) right.scale.set(1, scaleY, 1);
      }
    }
  });

  return (
    <group>
      {/* Normal eyes (pill shaped) */}
      <mesh
        ref={leftRef}
        position={[-0.22, 0.0, 1.02]}
        geometry={normalGeometry}
        material={material}
        renderOrder={10}
      />
      <mesh
        ref={rightRef}
        position={[0.22, 0.0, 1.02]}
        geometry={normalGeometry}
        material={material}
        renderOrder={10}
      />

      {/* Hit eyes (">" angled shape) */}
      <mesh
        ref={leftHitMeshRef}
        position={[-0.22, 0.0, 1.02]}
        geometry={hitGeometry}
        material={material}
        visible={false}
        renderOrder={10}
      />
      <mesh
        ref={rightHitMeshRef}
        position={[0.22, 0.0, 1.02]}
        geometry={hitGeometry}
        material={material}
        visible={false}
        scale={[-1, 1, 1]}
        renderOrder={10}
      />
    </group>
  );
}
