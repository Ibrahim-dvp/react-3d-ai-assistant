import { useRef, useMemo, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { vertexShader, fragmentShader } from './shaders';
import Eyes from './Eyes';
import RippleRings from './RippleRings';

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
}) {
  const meshRef = useRef();
  const groupRef = useRef();
  const rotTarget = useRef({ x: 0, y: 0 });

  const [blinkCount, setBlinkCount] = useState(0);
  const handleBlink = useCallback(() => {
    setBlinkCount((c) => c + 1);
  }, []);

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

  useFrame((state) => {
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

  return (
    <group ref={groupRef} scale={scale}>
      {/* Dark transparent outer shell (sparkles sit between this and inner sphere) */}
      <mesh geometry={outerGeo} material={outerMaterial} renderOrder={0} />

      {/* Main iridescent sphere */}
      <mesh ref={meshRef} geometry={sphereGeo} renderOrder={1}>
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          side={THREE.FrontSide}
        />
      </mesh>

      {/* Eyes rendered on top */}
      <Eyes onBlink={handleBlink} />

      {/* Radar ripple rings triggered by blinks */}
      <RippleRings blinkTrigger={blinkCount} />
    </group>
  );
}
