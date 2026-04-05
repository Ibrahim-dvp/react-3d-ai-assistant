import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import IridescentSphere from './IridescentSphere';
import Particles from './Particles';
import BackGlow from './BackGlow';

function getResponsiveProfile(width, height) {
  const safeHeight = Math.max(height, 1);
  const aspect = width / safeHeight;

  const isPhone = width < 640 || aspect < 0.72;
  const isTablet = !isPhone && width < 1024;

  const scaleMultiplier = isPhone ? 0.86 : isTablet ? 0.93 : 1;
  const narrowAspectMultiplier = aspect < 0.6 ? 0.92 : 1;

  return {
    cameraZ: isPhone ? 4.9 : isTablet ? 4.5 : 4,
    fov: isPhone ? 56 : isTablet ? 50 : 45,
    maxDpr: isPhone ? 1.25 : isTablet ? 1.5 : 2,
    scaleMultiplier: scaleMultiplier * narrowAspectMultiplier,
  };
}

function ResponsiveScene({
  scale,
  profile,
  colorPalette,
  animationSpeed,
  enableMouseTracking,
  onFirstHit,
}) {
  const effectiveScale = scale * profile.scaleMultiplier;

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[2, 2, 3]} intensity={1.0} />
      <directionalLight position={[-1, 1, 2]} intensity={0.3} color="#aaccff" />

      <BackGlow />
      <Particles />
      <IridescentSphere
        scale={effectiveScale}
        colorPalette={colorPalette}
        animationSpeed={animationSpeed}
        enableMouseTracking={enableMouseTracking}
        onFirstHit={onFirstHit}
      />
    </>
  );
}

export default function AIVoiceAssistant({
  scale = 1,
  colorPalette,
  animationSpeed = 1,
  enableMouseTracking = true,
  onFirstHit,
  style,
  className,
}) {
  const containerRef = useRef(null);
  const [containerSize, setContainerSize] = useState({ width: 1280, height: 720 });

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return undefined;

    const updateSize = (width, height) => {
      setContainerSize((prev) => {
        if (prev.width === width && prev.height === height) return prev;
        return { width, height };
      });
    };

    const resizeObserver = new ResizeObserver(([entry]) => {
      if (!entry?.contentRect) return;
      const width = Math.max(1, Math.round(entry.contentRect.width));
      const height = Math.max(1, Math.round(entry.contentRect.height));
      updateSize(width, height);
    });

    resizeObserver.observe(element);
    return () => resizeObserver.disconnect();
  }, []);

  const profile = useMemo(
    () => getResponsiveProfile(containerSize.width, containerSize.height),
    [containerSize.width, containerSize.height]
  );

  const cameraSettings = useMemo(
    () => ({
      position: [0, 0, profile.cameraZ],
      fov: profile.fov,
      near: 0.1,
      far: 100,
    }),
    [profile.cameraZ, profile.fov]
  );

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: '100%',
        height: '100%',
        background: '#0a0a0a',
        ...style,
      }}
    >
      <Canvas
        key={`${cameraSettings.fov}-${cameraSettings.position[2]}`}
        camera={cameraSettings}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, profile.maxDpr]}
      >
        <color attach="background" args={['#0a0a0a']} />
        <ResponsiveScene
          scale={scale}
          profile={profile}
          colorPalette={colorPalette}
          animationSpeed={animationSpeed}
          enableMouseTracking={enableMouseTracking}
          onFirstHit={onFirstHit}
        />
      </Canvas>
    </div>
  );
}
