import { IdentityEvent } from '@basenative/shared-types';

type EventHandler = (event: IdentityEvent) => void;

const handlers: EventHandler[] = [];

export const eventBus = {
  subscribe(handler: EventHandler): () => void {
    handlers.push(handler);
    return () => {
      const idx = handlers.indexOf(handler);
      if (idx >= 0) handlers.splice(idx, 1);
    };
  },

  publish(event: IdentityEvent): void {
    for (const handler of handlers) {
      handler(event);
    }
  },
};
