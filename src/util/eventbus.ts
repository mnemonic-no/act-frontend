import { ActEvent } from '../core/events';

export interface IEventBusListener {
  id: string;
  handler: (event: ActEvent) => void;
}

class EventBus {
  listeners: Map<string, IEventBusListener> = new Map();

  subscribe(listener: IEventBusListener): void {
    this.listeners.set(listener.id, listener);
  }

  unsubscribe(id: string): void {
    this.listeners.delete(id);
  }

  publish(events: Array<ActEvent>): void {
    events.forEach(e => {
      for (const l of this.listeners.values()) {
        l.handler(e);
      }
    });
  }
}

export default EventBus;
