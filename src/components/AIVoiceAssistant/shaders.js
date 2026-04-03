// --------------------------------------------------------------------------
// GLSL Shaders — Luminous glass bubble matching the reference:
//   - Large flowing color blobs that slowly morph
//   - Vivid saturated colors: cyan, blue, purple, magenta, orange, red, pink
//   - Prominent white curved glass-reflection overlays
//   - Strong fresnel rim
// --------------------------------------------------------------------------

export const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uAnimationSpeed;

  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vWorldPosition;
  varying vec3 vViewDir;
  varying vec3 vObjectPos;

  void main() {
    vObjectPos = position;

    vec4 worldPos  = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    vNormal        = normalize((modelMatrix * vec4(normal, 0.0)).xyz);

    vec4 viewPos   = viewMatrix * worldPos;
    vViewPosition  = viewPos.xyz;

    vViewDir = normalize(cameraPosition - worldPos.xyz);

    gl_Position = projectionMatrix * viewPos;
  }
`;

export const fragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uAnimationSpeed;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  uniform vec3 uColor4;

  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vWorldPosition;
  varying vec3 vViewDir;
  varying vec3 vObjectPos;

  // --- Simplex 3D noise ---
  vec4 permute(vec4 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g  = step(x0.yzx, x0.xyz);
    vec3 l  = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod(i, 289.0);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 1.0 / 7.0;
    vec3  ns = n_ * D.wyz - D.xzx;
    vec4 j  = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x  = x_ * ns.x + ns.yyyy;
    vec4 y  = y_ * ns.x + ns.yyyy;
    vec4 h  = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    float t = uTime * uAnimationSpeed * 0.4;
    vec3 N = normalize(vNormal);
    vec3 V = normalize(vViewDir);
    vec3 pos = vObjectPos;

    // =================================================================
    // 1. LARGE FLOWING COLOR BLOBS
    //    6 vivid colors placed by large-scale noise (scale 0.5-0.7)
    //    that slowly morphs. Each blob covers ~1/3 of the sphere.
    // =================================================================

    // Vivid color palette (matching reference frames)
    vec3 cCyan    = vec3(0.0, 0.9, 1.0);     // bright cyan
    vec3 cBlue    = vec3(0.15, 0.45, 1.0);   // vivid blue
    vec3 cPurple  = vec3(0.6, 0.2, 0.9);     // purple
    vec3 cMagenta = vec3(0.95, 0.25, 0.65);  // hot magenta/pink
    vec3 cOrange  = vec3(1.0, 0.5, 0.1);     // warm orange
    vec3 cRed     = vec3(1.0, 0.15, 0.3);    // bright red

    // Two large-scale noise fields to drive blob placement
    // These create the sweeping, slowly-morphing color regions
    float n1 = snoise(pos * 0.6 + vec3(t * 0.25, t * 0.15, t * 0.1)) * 0.5 + 0.5;
    float n2 = snoise(pos * 0.55 + vec3(-t * 0.15, t * 0.2, -t * 0.12)) * 0.5 + 0.5;

    // Combine with spatial position for stable-ish placement
    // Angular position on sphere provides the base layout
    float angle = atan(pos.x, pos.z) / 3.14159 * 0.5 + 0.5;  // 0..1 around sphere
    float height = pos.y * 0.5 + 0.5;  // 0..1 bottom to top

    // Blend parameter: combines angle + noise for flowing regions
    float blend = angle * 0.5 + n1 * 0.3 + n2 * 0.2;
    blend = fract(blend);  // wrap around

    // Height-influenced secondary blend
    float vBlend = height * 0.4 + n2 * 0.4 + n1 * 0.2;
    vBlend = clamp(vBlend, 0.0, 1.0);

    // Map blend to 6 colors in a smooth cycle
    vec3 col;
    if (blend < 0.167) {
      col = mix(cCyan, cBlue, smoothstep(0.0, 0.167, blend));
    } else if (blend < 0.333) {
      col = mix(cBlue, cPurple, smoothstep(0.167, 0.333, blend));
    } else if (blend < 0.5) {
      col = mix(cPurple, cMagenta, smoothstep(0.333, 0.5, blend));
    } else if (blend < 0.667) {
      col = mix(cMagenta, cRed, smoothstep(0.5, 0.667, blend));
    } else if (blend < 0.833) {
      col = mix(cRed, cOrange, smoothstep(0.667, 0.833, blend));
    } else {
      col = mix(cOrange, cCyan, smoothstep(0.833, 1.0, blend));
    }

    // Subtle vertical color variation
    col = mix(col, mix(cMagenta, cCyan, vBlend), 0.15);

    // Boost vibrancy
    float lum = dot(col, vec3(0.299, 0.587, 0.114));
    col = mix(vec3(lum), col, 1.3);

    // =================================================================
    // 2. WHITE GLASS-REFLECTION OVERLAYS
    //    5 large, soft, elongated shapes — stretched along one axis
    //    via anisotropic coordinate scaling before sampling noise.
    //    Faster movement, bigger volume, softer/rounder edges.
    // =================================================================

    // Stretch helpers — elongate noise along different axes
    vec3 stretchA = vec3(pos.x * 0.3, pos.y * 0.8, pos.z * 0.5);
    vec3 stretchB = vec3(pos.x * 0.7, pos.y * 0.3, pos.z * 0.6);
    vec3 stretchC = vec3(pos.x * 0.5, pos.y * 0.6, pos.z * 0.3);
    vec3 stretchD = vec3(pos.x * 0.4, pos.y * 0.35, pos.z * 0.7);
    vec3 stretchE = vec3(pos.x * 0.6, pos.y * 0.7, pos.z * 0.35);

    // Layer A: very large horizontal sweep
    float wA = snoise(stretchA * 0.5 + vec3(t * 0.8, -t * 0.5, t * 0.35));
    wA = smoothstep(-0.15, 0.45, wA);
    col = mix(col, vec3(1.0), wA * 0.28);

    // Layer B: large vertical band
    float wB = snoise(stretchB * 0.55 + vec3(-t * 0.5, t * 0.7, -t * 0.4));
    wB = smoothstep(-0.1, 0.45, wB);
    col = mix(col, vec3(1.0), wB * 0.24);

    // Layer C: diagonal soft arc
    float wC = snoise(stretchC * 0.6 + vec3(t * 0.6, t * 0.4, t * 0.75));
    wC = smoothstep(-0.05, 0.5, wC);
    col = mix(col, vec3(1.0, 0.98, 0.96), wC * 0.20);

    // Layer D: massive slow-moving glow
    float wD = snoise(stretchD * 0.35 + vec3(-t * 0.3, t * 0.35, -t * 0.2));
    wD = smoothstep(-0.2, 0.5, wD);
    col = mix(col, vec3(1.0), wD * 0.14);

    // Layer E: wide curved caustic
    float wE = snoise(stretchE * 0.5 + vec3(t * 0.9, -t * 0.6, t * 0.5));
    wE = smoothstep(-0.1, 0.5, wE);
    col = mix(col, vec3(1.0), wE * 0.18);

    // =================================================================
    // 3. FRESNEL — strong bright rim (glass edge)
    // =================================================================
    float NdotV  = max(dot(V, N), 0.0);
    float fresnel = pow(1.0 - NdotV, 3.0);

    vec3 rimTint = vec3(0.9, 0.96, 1.0);
    col += rimTint * fresnel * 0.35;

    // =================================================================
    // 4. SPECULAR — subtle gloss only, no sun-spot
    // =================================================================
    vec3  L = normalize(vec3(1.0, 1.0, 1.0));
    vec3  H = normalize(L + V);
    float spec = pow(max(dot(N, H), 0.0), 180.0);
    col += vec3(1.0) * spec * 0.25;

    vec3  L2 = normalize(vec3(-0.5, 0.6, 0.8));
    vec3  H2 = normalize(L2 + V);
    float spec2 = pow(max(dot(N, H2), 0.0), 64.0);
    col += vec3(0.95, 0.97, 1.0) * spec2 * 0.1;

    // =================================================================
    // 5. SOFT DIFFUSE WRAP
    // =================================================================
    float diff = max(dot(N, L), 0.0) * 0.15 + 0.85;
    col *= diff;

    // =================================================================
    // 6. ALPHA — translucent glass
    // =================================================================
    float alpha = mix(0.82, 1.0, fresnel * 0.65);

    gl_FragColor = vec4(col, alpha);
  }
`;
