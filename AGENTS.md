# AI Voice Assistant 3D Component - Agent Guide

> **Project**: React/Vue 3D AI Voice Assistant  
> **Package**: `@ibrahim-org/react-3d-ai-assistant` / `@ibrahim-org/vue-3d-ai-assistant`  
> **License**: MIT  
> **Author**: Ibrahim Bensaadoune

---

## Project Overview

This is a **dual-framework 3D component library** providing an interactive AI voice assistant sphere for both React and Vue applications. The component renders a stunning 3D animated sphere with:

- **Iridescent glass shader** with 6 vivid flowing color zones (cyan, blue, purple, magenta, orange, red)
- **Custom GLSL shaders** with 3D Simplex noise, Fresnel rim glow, and Blinn-Phong specular highlights
- **Pill-shaped blinking eyes** with natural random timing and double-blink support
- **Fire-ember sparkle particles** that spawn on the sphere surface and fall with gravity
- **Blink-triggered radar ripple rings** for visual feedback
- **Mouse-tracking rotation** with smooth lerp interpolation
- **Responsive design** with device-specific camera profiles (phone/tablet/desktop)

---

## Monorepo Structure

```
AI voice assistant/
├── src/                          # React package source
│   ├── components/
│   │   └── AIVoiceAssistant/
│   │       ├── index.jsx         # Main component with Canvas wrapper
│   │       ├── IridescentSphere.jsx   # Core sphere with shader material
│   │       ├── Eyes.jsx          # Blinking pill-shaped eyes
│   │       ├── Particles.jsx     # Fire-ember sparkle system
│   │       ├── BackGlow.jsx      # Warm radial glow background
│   │       ├── RippleRings.jsx   # Radar pulse effect on blink
│   │       └── shaders.js        # GLSL vertex & fragment shaders
│   ├── lib.js                    # Library entry point (public exports)
│   ├── App.jsx                   # Demo app entry
│   ├── main.jsx                  # Demo app bootstrap
│   └── index.css                 # Demo styles
├── vue-3d-ai-assistant/          # Vue package (separate npm package)
│   ├── src/
│   │   ├── components/AIVoiceAssistant/   # Vue equivalents (.vue files)
│   │   ├── lib.js                # Vue library entry point
│   │   ├── App.vue               # Vue demo app
│   │   └── main.js               # Vue demo bootstrap
│   ├── package.json              # @ibrahim-org/vue-3d-ai-assistant
│   └── ...                       # Similar structure to React version
├── dist/                         # Build output (React)
├── public/                       # Static assets (favicon, icons)
├── package.json                  # @ibrahim-org/react-3d-ai-assistant
├── vite.config.js                # Demo app build config
├── vite.lib.config.js            # Library build config (ESM + CJS)
└── eslint.config.js              # ESLint flat config
```

---

## Technology Stack

### React Package
| Technology | Version | Purpose |
|------------|---------|---------|
| React | ^19.2.4 | UI framework |
| Three.js | ^0.183.2 | 3D/WebGL rendering |
| @react-three/fiber | ^9.5.0 | React renderer for Three.js |
| @react-three/drei | ^10.7.7 | R3F utilities |
| Vite | ^8.0.1 | Build tool |
| ESLint | ^9.39.4 | Linting |

### Vue Package
| Technology | Version | Purpose |
|------------|---------|---------|
| Vue | ^3.5.22 | UI framework |
| Three.js | ^0.180.0 | 3D/WebGL rendering |
| @tresjs/core | ^5.1.0 | Vue renderer for Three.js |
| Vite | ^5.4.21 | Build tool |

---

## Build Commands

### React Package (Root)

```bash
# Development server (runs demo app on http://localhost:5173)
npm run dev

# Build demo app for production
npm run build

# Build library for npm publishing (ESM + CJS)
npm run build:lib

# Lint codebase
npm run lint

# Preview production build
npm run preview

# Publish to npm (runs build:lib automatically)
npm publish
```

### Vue Package (vue-3d-ai-assistant/)

```bash
cd vue-3d-ai-assistant

# Development server
npm run dev

# Build library for npm publishing
npm run build:lib

# Lint codebase
npm run lint
```

---

## Component API

### Props (AIVoiceAssistant)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `scale` | `number` | `1` | Scale multiplier for the sphere |
| `colorPalette` | `string[]` | `['#00e5ff', '#ff00ff', '#ff2200', '#4400aa']` | Array of 4 hex colors seeding the shader palette |
| `animationSpeed` | `number` | `1` | Multiplier for all animations (noise, bobbing, ripples) |
| `enableMouseTracking` | `boolean` | `true` | Sphere rotates to follow the cursor |
| `style` | `CSSProperties` | `{}` | CSS overrides on the container `<div>` |
| `className` | `string` | — | Class applied to the container `<div>` |

### Exports

```javascript
// React
import { AIVoiceAssistant, IridescentSphere } from '@ibrahim-org/react-3d-ai-assistant';

// Vue
import { AIVoiceAssistant, IridescentSphere } from '@ibrahim-org/vue-3d-ai-assistant';
```

- `AIVoiceAssistant` — Full component with responsive Canvas wrapper
- `IridescentSphere` — Sphere only (for use in custom Canvas/Scene)

---

## Code Style Guidelines

### ESLint Configuration

- Uses ESLint v9 with flat config (`eslint.config.js`)
- Extends: `@eslint/js/recommended`, `react-hooks/recommended`, `react-refresh/vite`
- Target: `**/*.{js,jsx}` files
- Ignores: `dist/` directory

### Key Rules

```javascript
// Custom rule in eslint.config.js
'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }]
```

### Naming Conventions

- **Components**: PascalCase (`IridescentSphere.jsx`, `Eyes.jsx`)
- **Hooks**: camelCase with `use` prefix (standard React hooks)
- **Constants**: UPPER_SNAKE_CASE for true constants (e.g., `SPARKLE_COUNT`, `MAX_RINGS`)
- **Uniforms**: `u` prefix in shaders (e.g., `uTime`, `uColor1`)
- **Varyings**: `v` prefix in shaders (e.g., `vNormal`, `vViewPosition`)

### Code Patterns

#### Memoization for Three.js Objects

Always memoize geometries, materials, and uniforms to prevent re-instantiation on render:

```javascript
const sphereGeo = useMemo(() => new THREE.SphereGeometry(1, 128, 128), []);
const outerGeo = useMemo(() => new THREE.SphereGeometry(1.8, 64, 64), []);
```

#### Shader Uniforms Pattern

```javascript
const uniforms = useMemo(
  () => ({
    uTime: { value: 0 },
    uAnimationSpeed: { value: animationSpeed },
    uColor1: { value: colors.uColor1 },
    // ...
  }),
  [] // Intentionally empty - updated via useFrame
);
```

#### Animation Loop Pattern

```javascript
useFrame((state) => {
  const elapsed = state.clock.elapsedTime;
  // Update uniforms and transforms here
});
```

---

## File Organization

### React Component Structure

Each visual element is a separate component file:

| File | Responsibility |
|------|----------------|
| `index.jsx` | Main export, responsive Canvas wrapper, ResizeObserver |
| `IridescentSphere.jsx` | Core sphere mesh, shader material, mouse tracking, bobbing |
| `shaders.js` | GLSL vertex and fragment shaders (200+ lines of shader code) |
| `Eyes.jsx` | Pill-shaped extruded geometry, blink animation state |
| `Particles.jsx` | 500-particle buffer geometry, spawn/despawn lifecycle |
| `BackGlow.jsx` | Canvas-generated radial gradient sprite |
| `RippleRings.jsx` | Ring geometry pool, expand/fade animation on blink |

### Shader Architecture

The fragment shader (`shaders.js`) implements:

1. **3D Simplex Noise** — For organic color blob movement
2. **6-Color Palette Mixing** — Cyan → Blue → Purple → Magenta → Red → Orange
3. **5-Layer Glass Reflections** — White overlay layers with anisotropic scaling
4. **Fresnel Rim Effect** — Strong bright rim for glass edge simulation
5. **Blinn-Phong Specular** — Subtle gloss highlights
6. **Translucent Alpha** — Variable opacity based on viewing angle

---

## Peer Dependencies

Consumers must install these separately:

### React
```bash
npm install three @react-three/fiber @react-three/drei react react-dom
```

### Vue
```bash
npm install three @tresjs/core vue
```

---

## Library Build Configuration

### vite.lib.config.js

Key settings for library builds:

- **Entry**: `src/lib.js`
- **Formats**: ESM (`es`) + CJS (`cjs`)
- **External**: React, Three.js, and R3F packages (not bundled)
- **Sourcemaps**: Enabled
- **Public Dir**: Not copied (favicons excluded from library)

### Published Files

Only these are included in npm package:
- `dist/` (built library)
- `LICENSE`
- `README.md`

---

## Responsive Behavior

The component adapts to device capabilities via `getResponsiveProfile()`:

| Device | Width | Camera Z | FOV | Max DPR | Scale Multiplier |
|--------|-------|----------|-----|---------|------------------|
| Phone | < 640px | 4.9 | 56° | 1.25 | 0.86 |
| Tablet | 640-1024px | 4.5 | 50° | 1.5 | 0.93 |
| Desktop | > 1024px | 4.0 | 45° | 2.0 | 1.0 |

---

## Testing Strategy

**Note**: This project currently does not include automated tests. When adding tests:

1. **Visual Regression**: Use Playwright or Chromatic for shader visual tests
2. **Component Tests**: Test prop changes affect uniforms correctly
3. **Interaction Tests**: Verify mouse tracking and resize behavior

---

## Performance Considerations

- **DPR Limiting**: `dpr={[1, profile.maxDpr]}` prevents over-rendering on mobile
- **Geometry Caching**: All geometries created once via `useMemo`
- **Buffer Geometry**: Particles use `BufferGeometry` with direct array manipulation
- **Render Order**: Explicit `renderOrder` prevents transparency issues
- **Depth Write Disabled**: On transparent materials for proper blending

---

## Security Considerations

- No user input is passed to shaders (colorPalette is hex-validated via THREE.Color)
- No XSS vectors (component only accepts primitive props)
- Canvas is created internally, no external URL loading

---

## Live Demo

- **React**: https://react-3d-ai-assistant.vercel.app
- **Vue**: Check respective package README

---

## Common Tasks

### Adding a New Uniform to Shader

1. Add uniform declaration in `shaders.js` (both vertex and fragment)
2. Add to `uniforms` object in `IridescentSphere.jsx`
3. Update in `useFrame` loop

### Modifying Eye Behavior

Edit `Eyes.jsx`:
- `blink.current.duration` — Blink speed
- `bs.nextBlink` calculation — Blink interval randomization
- Geometry dimensions in `createRoundedRectShape()` — Eye size

### Adjusting Particle Count

Edit `Particles.jsx`:
- Change `SPARKLE_COUNT` constant (default: 500)

---

## Links

- **React npm**: https://www.npmjs.com/package/@ibrahim-org/react-3d-ai-assistant
- **Vue npm**: https://www.npmjs.com/package/@ibrahim-org/vue-3d-ai-assistant
- **GitHub (React)**: https://github.com/Ibrahim-dvp/react-3d-ai-assistant
- **GitHub (Vue)**: https://github.com/Ibrahim-dvp/vue-3d-ai-assistant
