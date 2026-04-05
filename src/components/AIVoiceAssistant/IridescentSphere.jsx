import { useRef, useMemo, useState, useCallback, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { vertexShader, fragmentShader } from './shaders';
import Eyes from './Eyes';
import RippleRings from './RippleRings';
import ImpactFlash from './ImpactFlash';

// Palette passed as uniforms (used as fallback seeds, actual colors are in shader)
const DEFAULT_COLORS = ['#00e5ff', '#ff00ff', '#ff2200', '#4400aa'];

function hexToVec3(hex) {
  const c = new THREE.Color(hex);
  return new THREE.Vector3(c.r, c.g, c.b);
}

export default function IridescentSphere({
  scale = 1,
  colorPalette = DEFAULT_COLORS,
  animationSpeed = 1,
  enableMouseTracking = true,
  onFirstHit,
}) {
  const meshRef = useRef();
  const groupRef = useRef();
  const rotTarget = useRef({ x: 0, y: 0 });

  const recoilRef = useRef({ active: false, timer: 0, duration: 0.35 });
  const prevHitRef = useRef(false);

  const [blinkCount, setBlinkCount] = useState(0);
  const handleBlink = useCallback(() => {
    setBlinkCount((c) => c + 1);
  }, []);

  // Hit state for click reaction
  const [isHit, setIsHit] = useState(false);
  const hitTimeoutRef = useRef(null);
  const hasHitRef = useRef(false);

  const handlePointerDown = useCallback(() => {
    setIsHit(true);

    if (!hasHitRef.current && onFirstHit) {
      hasHitRef.current = true;
      onFirstHit();
    }

    if (hitTimeoutRef.current) {
      clearTimeout(hitTimeoutRef.current);
    }
    hitTimeoutRef.current = setTimeout(() => {
      setIsHit(false);
      hitTimeoutRef.current = null;
    }, 400);
  }, [onFirstHit]);

  const colors = useMemo(
    () => ({
      uColor1: hexToVec3(colorPalette[0] || DEFAULT_COLORS[0]),
      uColor2: hexToVec3(colorPalette[1] || DEFAULT_COLORS[1]),
      uColor3: hexToVec3(colorPalette[2] || DEFAULT_COLORS[2]),
      uColor4: hexToVec3(colorPalette[3] || DEFAULT_COLORS[3]),
    }),
    [colorPalette]
  );

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAnimationSpeed: { value: animationSpeed },
      uColor1: { value: colors.uColor1 },
      uColor2: { value: colors.uColor2 },
      uColor3: { value: colors.uColor3 },
      uColor4: { value: colors.uColor4 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const sphereGeo = useMemo(() => new THREE.SphereGeometry(1, 128, 128), []);
  const outerGeo = useMemo(() => new THREE.SphereGeometry(1.8, 64, 64), []);

  const outerMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#000000',
        transparent: true,
        opacity: 0.35,
        side: THREE.BackSide,
        depthWrite: false,
      }),
    []
  );

  useFrame((state, delta) => {
    const elapsed = state.clock.elapsedTime;

    if (meshRef.current) {
      meshRef.current.material.uniforms.uTime.value = elapsed;
      meshRef.current.material.uniforms.uAnimationSpeed.value = animationSpeed;
      meshRef.current.material.uniforms.uColor1.value.copy(colors.uColor1);
      meshRef.current.material.uniforms.uColor2.value.copy(colors.uColor2);
      meshRef.current.material.uniforms.uColor3.value.copy(colors.uColor3);
      meshRef.current.material.uniforms.uColor4.value.copy(colors.uColor4);
    }

    if (!groupRef.current) return;

    // Detect hit rising edge
    if (isHit && !prevHitRef.current) {
      recoilRef.current.active = true;
      recoilRef.current.timer = 0;
    }
    prevHitRef.current = isHit;

    // Sphere recoil z-offset
    if (recoilRef.current.active && groupRef.current) {
      recoilRef.current.timer += delta;
      const rt = recoilRef.current.timer / recoilRef.current.duration;

      if (rt >= 1.0) {
        recoilRef.current.active = false;
        groupRef.current.position.z = 0;
      } else if (rt < 0.14) {
        // Push back: 0 → -0.05 over first 14%
        groupRef.current.position.z = (rt / 0.14) * -0.05;
      } else {
        // Elastic return
        const p = (rt - 0.14) / 0.86;
        const elastic = 1 - Math.pow(2, -10 * p) * Math.cos((p * 10 - 0.75) * ((2 * Math.PI) / 3));
        groupRef.current.position.z = -0.05 + 0.05 * elastic;
      }
    }

    groupRef.current.position.y = Math.sin(elapsed * animationSpeed * 0.6) * 0.12;

    if (enableMouseTracking) {
      rotTarget.current.y = state.pointer.x * 0.35;
      rotTarget.current.x = -state.pointer.y * 0.25;
    } else {
      rotTarget.current.x = 0;
      rotTarget.current.y = 0;
    }

    const lerpFactor = 0.04;
    groupRef.current.rotation.x +=
      (rotTarget.current.x - groupRef.current.rotation.x) * lerpFactor;
    groupRef.current.rotation.y +=
      (rotTarget.current.y - groupRef.current.rotation.y) * lerpFactor;
  });

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hitTimeoutRef.current) {
        clearTimeout(hitTimeoutRef.current);
      }
      document.body.style.cursor = '';
    };
  }, []);

  return (
    <group ref={groupRef} scale={scale}>
      {/* Dark transparent outer shell (sparkles sit between this and inner sphere) */}
      <mesh geometry={outerGeo} material={outerMaterial} renderOrder={0} />

      {/* Main iridescent sphere - click target */}
      <mesh
        ref={meshRef}
        geometry={sphereGeo}
        renderOrder={1}
        onPointerDown={handlePointerDown}
        onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = ''; }}
      >
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          side={THREE.FrontSide}
        />
      </mesh>

      {/* Hit flash effect */}
      <ImpactFlash isActive={isHit} />

      {/* Eyes rendered on top */}
      <Eyes onBlink={handleBlink} isHit={isHit} />

      {/* Radar ripple rings triggered by blinks */}
      <RippleRings blinkTrigger={blinkCount} />
    </group>
  );
}
