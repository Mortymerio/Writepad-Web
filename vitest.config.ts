import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.{ts,js}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/core/**', 'src/ui/**']
    },
    alias: {
      'monaco-editor': 'monaco-editor/esm/vs/editor/editor.api.js'
    }
  }
});
