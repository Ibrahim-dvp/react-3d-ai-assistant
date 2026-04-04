# react-3d-ai-assistant &nbsp;·&nbsp; [Live Demo](https://react-3d-ai-assistant.vercel.app)

[![npm](https://img.shields.io/npm/v/@ibrahim-org/react-3d-ai-assistant)](https://www.npmjs.com/package/@ibrahim-org/react-3d-ai-assistant)
[![license](https://img.shields.io/npm/l/@ibrahim-org/react-3d-ai-assistant)](./LICENSE)
[![demo](https://img.shields.io/badge/demo-live-brightgreen)](https://react-3d-ai-assistant.vercel.app)

A reusable React Three Fiber component that renders an interactive 3D voice assistant sphere — iridescent glass material, blinking eyes, fire-ember sparkles, and blink-triggered radar ripple rings.

---

## Installation

```bash
npm install @ibrahim-org/react-3d-ai-assistant
```

### Peer dependencies (install separately if not already present)

```bash
npm install three @react-three/fiber @react-three/drei react react-dom
```

---

## Usage

```jsx
import { AIVoiceAssistant } from '@ibrahim-org/react-3d-ai-assistant';

export default function App() {
  return (
    <div
      style={{
        width: 'min(100%, 960px)',
        height: 'min(78dvh, 760px)',
        minHeight: 320,
        margin: '0 auto',
      }}
    >
      <AIVoiceAssistant />
    </div>
  );
}
```

The component owns its own `<Canvas>` and adapts to its parent container size.
Use any responsive CSS strategy for the parent (grid, flex, aspect-ratio, clamp, media queries).

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `scale` | `number` | `1` | Scale multiplier for the sphere |
| `colorPalette` | `string[]` | see below | Array of **4 hex colors** seeding the shader palette |
| `animationSpeed` | `number` | `1` | Multiplier for all animations (noise, bobbing, ripples) |
| `enableMouseTracking` | `boolean` | `true` | Sphere rotates to follow the cursor |
| `style` | `CSSProperties` | `{}` | CSS overrides on the container `<div>` |
| `className` | `string` | — | Class applied to the container `<div>` |

### Default color palette

```js
['#00e5ff', '#ff00ff', '#ff2200', '#4400aa']
// Cyan, Magenta, Red, Deep Purple
```

### Custom palette example

```jsx
<AIVoiceAssistant
  scale={1.3}
  animationSpeed={1.2}
  colorPalette={['#00ffcc', '#ff00aa', '#ff4400', '#220066']}
  enableMouseTracking={true}
/>
```

---

## Using only the sphere inside your own Canvas

```jsx
import { Canvas } from '@react-three/fiber';
import { IridescentSphere } from '@ibrahim-org/react-3d-ai-assistant';

export default function Scene() {
  return (
    <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
      <ambientLight intensity={0.4} />
      <IridescentSphere scale={1.2} animationSpeed={1} enableMouseTracking />
    </Canvas>
  );
}
```

---

## Features

- Custom GLSL vertex + fragment shader — 3D Simplex noise, Fresnel rim glow, Blinn-Phong specular
- 6 vivid flowing color zones (cyan, blue, purple, magenta, red, orange) that slowly morph
- 5 floating white semi-transparent glass-reflection overlay layers
- Pill-shaped blinking eyes with natural random timing and double-blink
- Fire-ember sparkle particles that spawn on the sphere surface and fall with gravity
- Blink-triggered radar ripple rings
- Dark transparent outer shell
- Smooth mouse-tracking rotation with lerp
- Sine-wave bobbing animation
- All visual computation on the GPU
- Memoized geometries and materials — no re-instantiation on render

---

## Links

- [Live Demo](https://react-3d-ai-assistant.vercel.app)
- [GitHub](https://github.com/Ibrahim-dvp/react-3d-ai-assistant)
- [npm](https://www.npmjs.com/package/@ibrahim-org/react-3d-ai-assistant)

---

## License

MIT © 2026 [Ibrahim Bensaadoune](https://github.com/Ibrahim-dvp)
