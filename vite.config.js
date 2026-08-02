import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  base: '/Writepad-Web/',
  resolve: {
    alias: {
      'monaco-editor/esm/vs/editor/editor.api': 'monaco-editor/esm/vs/editor/editor.api.js',
      'monaco-editor/esm/vs/editor/common/commands/shiftCommand': 'monaco-editor/esm/vs/editor/common/commands/shiftCommand.js'
    }
  }
});
