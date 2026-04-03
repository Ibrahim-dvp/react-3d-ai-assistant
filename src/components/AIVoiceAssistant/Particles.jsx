import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const SPARKLE_COUNT = 500;

// Fire ember sparkles that originate from the sphere surface and fall/drift down
export default function Particles() {
  const ref = useRef();

  const velocities = useMemo(() => new Float32Array(SPARKLE_COUNT * 3), []);
  const lifetimes = useMemo(() => new Float32Array(SPARKLE_COUNT), []);
  const maxLifetimes = useMemo(() => new Float32Array(SPARKLE_COUNT), []);

  const geometry = useMemo(() => {
    const pos = new Float32Array(SPARKLE_COUNT * 3);
    const colors = new Float32Array(SPARKLE_COUNT * 3);

    for (let i = 0; i < SPARKLE_COUNT; i++) {
      // Start on sphere surface (radius ~1.05)
      spawnParticle(i, pos, velocities, lifetimes, maxLifetimes);

      // Warm colors: gold to orange to red
      const warmth = Math.random();
      colors[i * 3] = 1.0;                         // R
      colors[i * 3 + 1] = 0.4 + warmth * 0.45;    // G: 0.4-0.85
      colors[i * 3 + 2] = 0.05 + warmth * 0.15;   // B: 0.05-0.2
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [velocities, lifetimes, maxLifetimes]);

  // Soft round sparkle texture
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.2, 'rgba(255, 200, 100, 0.8)');
    gradient.addColorStop(0.5, 'rgba(255, 150, 50, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);
    return new THREE.CanvasTexture(canvas);
  }, []);

  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        map: texture,
        size: 0.04,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.9,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [texture]
  );

  useFrame(() => {
    if (!ref.current) return;
    const posAttr = ref.current.geometry.attributes.position;
    const arr = posAttr.array;

    for (let i = 0; i < SPARKLE_COUNT; i++) {
      const ix = i * 3;
      const iy = i * 3 + 1;
      const iz = i * 3 + 2;

      // Move particle
      arr[ix] += velocities[ix];
      arr[iy] += velocities[iy];
      arr[iz] += velocities[iz];

      // Gravity pull
      velocities[iy] -= 0.00008;

      // Age particle
      lifetimes[i] -= 0.016;

      // Respawn when dead
      if (lifetimes[i] <= 0) {
        spawnParticle(i, arr, velocities, lifetimes, maxLifetimes);
      }
    }
    posAttr.needsUpdate = true;
  });

  return <points ref={ref} geometry={geometry} material={material} />;
}

function spawnParticle(i, positions, velocities, lifetimes, maxLifetimes) {
  const ix = i * 3;
  const iy = i * 3 + 1;
  const iz = i * 3 + 2;

  // Random point on sphere surface
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  const r = 1.05 + Math.random() * 0.1;

  const x = r * Math.sin(phi) * Math.cos(theta);
  const y = r * Math.sin(phi) * Math.sin(theta);
  const z = r * Math.cos(phi);

  positions[ix] = x;
  positions[iy] = y;
  positions[iz] = z;

  // Velocity: outward + downward drift (like embers falling)
  const outward = 0.002 + Math.random() * 0.004;
  const nx = x / r;
  const ny = y / r;
  const nz = z / r;

  velocities[ix] = nx * outward + (Math.random() - 0.5) * 0.001;
  velocities[iy] = ny * outward - 0.001 - Math.random() * 0.003; // downward bias
  velocities[iz] = nz * outward + (Math.random() - 0.5) * 0.001;

  // Random lifetime 1-4 seconds (at ~60fps, 60-240 frames)
  const life = 1.0 + Math.random() * 3.0;
  lifetimes[i] = life;
  maxLifetimes[i] = life;
}
