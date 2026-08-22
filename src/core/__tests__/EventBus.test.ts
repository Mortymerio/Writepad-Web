import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventBus } from '../EventBus';
import { EventMap } from '../../types/events';

describe('EventBus', () => {
  beforeEach(() => {
    EventBus.clear();
  });

  it('debería registrar y emitir eventos', () => {
    const handler = vi.fn();
    EventBus.on('THEME_CHANGED', handler);
    EventBus.emit('THEME_CHANGED', { theme: 'dark' });
    expect(handler).toHaveBeenCalledWith({ theme: 'dark' });
  });

  it('debería desubscribir handlers correctamente', () => {
    const handler = vi.fn();
    EventBus.on('THEME_CHANGED', handler);
    EventBus.off('THEME_CHANGED', handler);
    EventBus.emit('THEME_CHANGED', { theme: 'dark' });
    expect(handler).not.toHaveBeenCalled();
  });

  it('debería soportar once() (single-fire)', () => {
    const handler = vi.fn();
    EventBus.once('THEME_CHANGED', handler);
    EventBus.emit('THEME_CHANGED', { theme: 'dark' });
    EventBus.emit('THEME_CHANGED', { theme: 'light' });
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith({ theme: 'dark' });
  });

  it('debería manejar múltiples subscribers al mismo evento', () => {
    const handler1 = vi.fn();
    const handler2 = vi.fn();
    EventBus.on('THEME_CHANGED', handler1);
    EventBus.on('THEME_CHANGED', handler2);
    EventBus.emit('THEME_CHANGED', { theme: 'dark' });
    expect(handler1).toHaveBeenCalledTimes(1);
    expect(handler2).toHaveBeenCalledTimes(1);
  });

  it('debería ignorar emits sin subscribers (sin crash)', () => {
    expect(() => {
      EventBus.emit('THEME_CHANGED', { theme: 'dark' });
    }).not.toThrow();
  });

  it('debería pasar payload correctamente', () => {
    const handler = vi.fn();
    EventBus.on('TAB_CLOSED', handler);
    EventBus.emit('TAB_CLOSED', { index: 5 });
    expect(handler).toHaveBeenCalledWith({ index: 5 });
  });

  it('clear() debería eliminar todas las subscripciones', () => {
    const handler = vi.fn();
    EventBus.on('THEME_CHANGED', handler);
    EventBus.clear();
    EventBus.emit('THEME_CHANGED', { theme: 'dark' });
    expect(handler).not.toHaveBeenCalled();
  });
});
