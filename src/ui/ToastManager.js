/**
 * ToastManager — lightweight non-intrusive notification system.
 * Replaces all alert() calls throughout the app.
 * Usage: ToastManager.show("Message", "success" | "error" | "info" | "warning", durationMs?)
 */
export const ToastManager = {
  _container: null,

  _getContainer() {
    if (!this._container) {
      this._container = document.createElement('div');
      this._container.id = 'toast-container';
      this._container.style.cssText = `
        position: fixed;
        bottom: 40px;
        right: 20px;
        z-index: 99999;
        display: flex;
        flex-direction: column;
        gap: 8px;
        pointer-events: none;
      `;
      document.body.appendChild(this._container);
    }
    return this._container;
  },

  show(message, type = 'info', duration = 3000) {
    const container = this._getContainer();

    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };

    const colors = {
      success: { bg: '#1a3a1a', border: '#2ea043', text: '#79c0ff', icon: '#3fb950' },
      error:   { bg: '#3a1a1a', border: '#f85149', text: '#ffa198', icon: '#f85149' },
      warning: { bg: '#3a2a00', border: '#d29922', text: '#e3b341', icon: '#d29922' },
      info:    { bg: '#0d1a2d', border: '#388bfd', text: '#79c0ff', icon: '#58a6ff' }
    };

    const isDark = document.body.dataset.theme !== undefined && 
                   !['', 'github-light', 'Solarized-light', 'Tomorrow', 'Dawn', 'Clouds', 'Textmate (Mac Classic)', 'Katzenmilch', 'Dreamweaver', 'Chrome DevTools', 'Xcode_default'].includes(document.body.dataset.theme || '');

    const c = colors[type] || colors.info;

    const toast = document.createElement('div');
    toast.style.cssText = `
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 16px;
      background: var(--bg-secondary, ${isDark ? '#1c1c1c' : '#f0f0f0'});
      border: 1px solid ${c.border};
      border-left: 4px solid ${c.border};
      border-radius: 6px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.4);
      font-family: 'Inter', 'Segoe UI', sans-serif;
      font-size: 13px;
      color: var(--text-primary, #ccc);
      max-width: 380px;
      pointer-events: all;
      opacity: 0;
      transform: translateX(20px);
      transition: opacity 0.2s ease, transform 0.2s ease;
    `;

    const iconEl = document.createElement('span');
    iconEl.style.cssText = `color: ${c.border}; font-size: 14px; font-weight: bold; flex-shrink: 0;`;
    iconEl.textContent = icons[type] || icons.info;

    const msgEl = document.createElement('span');
    msgEl.style.cssText = 'flex: 1; line-height: 1.4;';
    msgEl.textContent = message;

    const closeEl = document.createElement('button');
    closeEl.style.cssText = `
      background: none; border: none; color: var(--text-primary, #999);
      cursor: pointer; font-size: 16px; line-height: 1; padding: 0;
      opacity: 0.5; flex-shrink: 0;
    `;
    closeEl.textContent = '×';
    closeEl.onclick = () => dismiss();

    toast.appendChild(iconEl);
    toast.appendChild(msgEl);
    toast.appendChild(closeEl);
    if (type === 'error') {
      toast.style.cursor = 'pointer';
      toast.title = 'Clic para copiar el error';
      toast.onclick = async (e) => {
        if (e.target === closeEl) return;
        try {
          await navigator.clipboard.writeText(message);
          this.success("Error copiado", 2000);
        } catch(err) {
          console.error("No se pudo copiar", err);
        }
      };
    }

    container.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(0)';
    });

    const dismiss = () => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(20px)';
      setTimeout(() => toast.remove(), 200);
    };

    if (duration > 0) {
      setTimeout(dismiss, duration);
    }

    return { dismiss };
  },

  success(msg, duration) { return this.show(msg, 'success', duration); },
  error(msg, duration = 10000)   { return this.show(msg, 'error', duration); },
  warning(msg, duration) { return this.show(msg, 'warning', duration); },
  info(msg, duration)    { return this.show(msg, 'info', duration); },
};
