import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  timestamp: number;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  readonly toasts = signal<Toast[]>([]);

  private idCounter = 0;
  private dismissTimers = new Map<string, ReturnType<typeof setTimeout>>();

  show(message: string, type: ToastType, duration = 5000): void {
    const id = `toast-${++this.idCounter}`;
    const toast: Toast = {
      id,
      message,
      type,
      timestamp: Date.now(),
    };

    this.toasts.update((current) => [...current, toast]);

    if (duration > 0) {
      const timeoutId = setTimeout(() => {
        this.dismiss(id);
      }, duration);

      this.dismissTimers.set(id, timeoutId);
    }
  }

  dismiss(id: string): void {
    const timeoutId = this.dismissTimers.get(id);
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
      this.dismissTimers.delete(id);
    }

    this.toasts.update((current) => current.filter((t) => t.id !== id));
  }
}
