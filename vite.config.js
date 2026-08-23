import { defineConfig } from 'vite';
import path from 'path';

// If Tauri is running the build, it injects TAURI_ENV_PLATFORM
const isTauri = !!process.env.TAURI_ENV_PLATFORM;

export default defineConfig({
  base: isTauri ? '' : '/Writepad-Web/',
  resolve: {
    alias: {
      'monaco-editor/esm/vs/editor/editor.api': 'monaco-editor/esm/vs/editor/editor.api.js',
      'monaco-editor/esm/vs/editor/common/commands/shiftCommand': 'monaco-editor/esm/vs/editor/common/commands/shiftCommand.js'
    }
  }
});
