import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// Library build config — produces ESM + CJS bundles for npm publishing.
// The demo app (vite.config.js) is kept separate for `npm run dev`.
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/lib.js'),
      name: 'React3dAiAssistant',
      fileName: 'index',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      // Peer dependencies must NOT be bundled
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'three',
        '@react-three/fiber',
        '@react-three/drei',
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          three: 'THREE',
          '@react-three/fiber': 'ReactThreeFiber',
          '@react-three/drei': 'Drei',
        },
      },
    },
    sourcemap: true,
    // Keep the dist folder clean
    emptyOutDir: true,
  },
});
