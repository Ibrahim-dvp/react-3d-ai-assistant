import { Canvas } from '@react-three/fiber';
import IridescentSphere from './IridescentSphere';
import Particles from './Particles';
import BackGlow from './BackGlow';

export default function AIVoiceAssistant({
  scale = 1,
  colorPalette,
  animationSpeed = 1,
  enableMouseTracking = true,
  style,
  className,
}) {
  return (
    <div
      className={className}
      style={{
        width: '100%',
        height: '100%',
        background: '#0a0a0a',
        ...style,
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 4], fov: 45 }}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#0a0a0a']} />

        <ambientLight intensity={0.5} />
        <directionalLight position={[2, 2, 3]} intensity={1.0} />
        <directionalLight position={[-1, 1, 2]} intensity={0.3} color="#aaccff" />

        <BackGlow />
        <Particles />
        <IridescentSphere
          scale={scale}
          colorPalette={colorPalette}
          animationSpeed={animationSpeed}
          enableMouseTracking={enableMouseTracking}
        />
      </Canvas>
    </div>
  );
}
