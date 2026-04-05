# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is `@ibrahim-org/react-3d-ai-assistant` — a published npm library that renders an interactive 3D AI voice assistant sphere using React Three Fiber. It ships both an `AIVoiceAssistant` component (owns its own `<Canvas>`) and a bare `IridescentSphere` for embedding in an existing Canvas scene.

## Commands

```bash
npm run dev          # Start demo app (Vite dev server)
npm run build        # Build demo app (not the library)
npm run build:lib    # Build the npm library → dist/ (ESM + CJS)
npm run lint         # ESLint
npm run preview      # Preview demo build
```

Publishing runs `prepublishOnly` which calls `build:lib` automatically.

## Architecture

### Two Vite configs

| Config | Purpose |
|--------|---------|
| `vite.config.js` | Demo app (`npm run dev`, `npm run build`) |
| `vite.lib.config.js` | Library build (`npm run build:lib`) — externalizes all peer deps, no public/ assets |

### Library entry

`src/lib.js` is the library entry point. Only `AIVoiceAssistant` and `IridescentSphere` are exported. Everything else is internal.

### Component hierarchy

```
AIVoiceAssistant (index.jsx)      ← owns <Canvas>, responsive sizing, ResizeObserver
  └── ResponsiveScene
        ├── BackGlow.jsx          ← blurred background glow blob
        ├── Particles.jsx         ← fire-ember sparkles with gravity simulation
        └── IridescentSphere.jsx  ← main sphere with GLSL shader, eyes, ripple rings
              ├── Eyes.jsx        ← pill-shaped blinking eyes, random double-blink timing
              ├── RippleRings.jsx ← radar ripple rings triggered on eye blink
              ├── ImpactFlash.jsx ← brief flash on blink impact
              └── shaders.js      ← GLSL vertex + fragment shader strings
```

### Shader system (`shaders.js`)

The sphere uses a fully custom GLSL shader (no three.js materials). Key techniques:
- 3D Simplex noise for morphing color zones
- Fresnel rim glow
- Blinn-Phong specular
- 5 glass-reflection overlay layers animated per-frame via uniforms

Uniforms updated every frame: `uTime`, `uMouseX/Y`, `uColor0–3`.

### Responsive behavior

`AIVoiceAssistant` uses a `ResizeObserver` on the container div to derive `cameraZ`, `fov`, `maxDpr`, and `scaleMultiplier` via `getResponsiveProfile()`. These are passed into `ResponsiveScene` so the sphere fits any parent size.

### Performance constraints

- All geometries and materials are `useMemo`-memoized — never re-instantiated on render.
- GPU-side computation via GLSL; no per-frame JS mesh mutation.
- `maxDpr` is capped per device class (phone: 1.25, tablet: 1.5, desktop: 2).

## vue-3d-ai-assistant/

A separate Vue 3 port of this component lives in `vue-3d-ai-assistant/`. It is an independent package with its own `package.json` and build config. Changes to the React source are **not** automatically reflected there.
