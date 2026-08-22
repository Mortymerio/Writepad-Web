# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: agent.spec.ts >> Writepad Web IDE >> debería abrir el hub de la comunidad
- Location: tests\e2e\agent.spec.ts:9:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('.sidebar-tab[title="AI Agents"]')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('.sidebar-tab[title="AI Agents"]')

```

```yaml
- text: File Edit Search View Encoding Language Macro Themes Settings Plugins AI ✨ ?
- button "New"
- button "Open"
- button "Save"
- button "Save All"
- button "Close"
- button "Close All"
- button "Print"
- button "Monitor (tail -f)"
- button "Cut"
- button "Copy"
- button "Paste"
- button "Undo"
- button "Redo"
- button "Find"
- button "Replace"
- button "Zoom In"
- button "Zoom Out"
- button "Word Wrap"
- button "Show All Characters"
- button
- button "Document List"
- button "Function List"
- button "TODO Tree"
- button "Folder as Workspace"
- button "Document Map (Minimap)"
- button "Run"
- button "Start Recording"
- button "Stop Recording" [disabled]
- button "Playback"
- button "Run Multiple Times"
- button "Save Macro"
- button "Saved Macros"
- button "AI Magic Wand (Prompt)"
- button "AI Agents"
- text: new 1 ×
- button "+"
- code:
  - textbox "Editor content;Press Alt+F1 for Accessibility Options."
- button "Toggle VIM mode": "VIM: OFF"
- button "VIM Cheat Sheet": 🥋 VIM-Fu
- combobox
- text: "length : 0 lines : 1 Ln : 1 Col : 1 UTF-8 CR LF Plain Text"
- alert
- alert
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Writepad Web IDE', () => {
  4  |   test('debería cargar la aplicación correctamente', async ({ page }) => {
  5  |     await page.goto('/');
  6  |     await expect(page).toHaveTitle(/Writepad Web/);
  7  |   });
  8  | 
  9  |   test('debería abrir el hub de la comunidad', async ({ page }) => {
  10 |     await page.goto('/');
  11 |     
  12 |     // Abrir el sidebar de IA
  13 |     const aiTab = page.locator('.sidebar-tab[title="AI Agents"]');
> 14 |     await expect(aiTab).toBeVisible();
     |                         ^ Error: expect(locator).toBeVisible() failed
  15 |     await aiTab.click();
  16 |     
  17 |     // Click en botón de Hub (asumiendo que tiene texto '🌐 Hub')
  18 |     const hubBtn = page.locator('button', { hasText: '🌐 Hub' });
  19 |     
  20 |     // Si aparece el modal de disclaimer, aceptarlo
  21 |     const acceptBtn = page.locator('button', { hasText: 'Entiendo los riesgos' });
  22 |     
  23 |     await expect(hubBtn).toBeVisible();
  24 |     await hubBtn.click();
  25 |     
  26 |     if (await acceptBtn.isVisible({ timeout: 2000 })) {
  27 |       await acceptBtn.click();
  28 |     }
  29 |     
  30 |     // Esperar a que cargue el hub
  31 |     const hubTitle = page.locator('text=Hub Comunitario');
  32 |     await expect(hubTitle).toBeVisible();
  33 |   });
  34 | 
  35 |   test('debería crear una pestaña nueva', async ({ page }) => {
  36 |     await page.goto('/');
  37 |     
  38 |     const addTabBtn = page.locator('.add-tab-btn');
  39 |     await expect(addTabBtn).toBeVisible();
  40 |     await addTabBtn.click();
  41 |     
  42 |     const tabs = page.locator('.tab-title');
  43 |     expect(await tabs.count()).toBeGreaterThan(1);
  44 |   });
  45 | });
  46 | 
```