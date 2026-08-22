import { EventMap } from '../types/events';

type EventHandler<T> = (payload: T) => void;

class EventBusImpl {
  private listeners: { [K in keyof EventMap]?: EventHandler<EventMap[K]>[] } = {};
  public debug = false;

  on<K extends keyof EventMap>(event: K, handler: EventHandler<EventMap[K]>): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(handler);
  }

  off<K extends keyof EventMap>(event: K, handler: EventHandler<EventMap[K]>): void {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event]!.filter(h => h !== handler);
  }

  once<K extends keyof EventMap>(event: K, handler: EventHandler<EventMap[K]>): void {
    const onceWrapper = (payload: EventMap[K]) => {
      this.off(event, onceWrapper);
      handler(payload);
    };
    this.on(event, onceWrapper);
  }

  emit<K extends keyof EventMap>(event: K, payload: EventMap[K]): void {
    if (this.debug) {
      console.log(`[EventBus] ${event}`, payload);
    }
    if (!this.listeners[event]) return;
    // Clone array to prevent issues if listeners modify the array during iteration
    const handlers = [...this.listeners[event]!];
    for (const handler of handlers) {
      try {
        handler(payload);
      } catch (error) {
        console.error(`[EventBus] Error in handler for ${event}:`, error);
      }
    }
  }

  clear(): void {
    this.listeners = {};
  }
}

export const EventBus = new EventBusImpl();
