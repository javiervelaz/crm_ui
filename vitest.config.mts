import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Tests unitarios de lógica pura (app/lib). Sin DOM: si un test necesita
// renderizar componentes, se agrega jsdom + Testing Library en ese momento.
export default defineConfig({
  // JSX con el runtime automático (como Next): permite renderToStaticMarkup sin importar React.
  esbuild: { jsx: 'automatic' },
  resolve: {
    alias: { '@': fileURLToPath(new URL('.', import.meta.url)) },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
