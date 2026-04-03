import { useMemo } from 'react';
import * as THREE from 'three';

// Warm orange-gold radial glow behind the sphere (matching sparkle color)
export default function BackGlow() {
  const material = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0, 'rgba(180, 100, 40, 0.35)');
    gradient.addColorStop(0.3, 'rgba(120, 50, 30, 0.18)');
    gradient.addColorStop(0.6, 'rgba(60, 20, 50, 0.08)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);

    const texture = new THREE.CanvasTexture(canvas);
    return new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, []);

  return <sprite material={material} position={[0, 0, -1.5]} scale={[7, 7, 1]} />;
}
