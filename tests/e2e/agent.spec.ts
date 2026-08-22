import { test, expect } from '@playwright/test';

test.describe('Writepad Web IDE', () => {
  test('debería cargar la aplicación correctamente', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Writepad Web/);
  });

  test('debería abrir el hub de la comunidad', async ({ page }) => {
    await page.goto('/');
    
    // Abrir el sidebar de IA
    const aiTab = page.locator('.sidebar-tab[title="AI Agents"]');
    await expect(aiTab).toBeVisible();
    await aiTab.click();
    
    // Click en botón de Hub (asumiendo que tiene texto '🌐 Hub')
    const hubBtn = page.locator('button', { hasText: '🌐 Hub' });
    
    // Si aparece el modal de disclaimer, aceptarlo
    const acceptBtn = page.locator('button', { hasText: 'Entiendo los riesgos' });
    
    await expect(hubBtn).toBeVisible();
    await hubBtn.click();
    
    if (await acceptBtn.isVisible({ timeout: 2000 })) {
      await acceptBtn.click();
    }
    
    // Esperar a que cargue el hub
    const hubTitle = page.locator('text=Hub Comunitario');
    await expect(hubTitle).toBeVisible();
  });

  test('debería crear una pestaña nueva', async ({ page }) => {
    await page.goto('/');
    
    const addTabBtn = page.locator('.add-tab-btn');
    await expect(addTabBtn).toBeVisible();
    await addTabBtn.click();
    
    const tabs = page.locator('.tab-title');
    expect(await tabs.count()).toBeGreaterThan(1);
  });
});
