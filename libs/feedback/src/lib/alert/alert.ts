import {
  Component,
  input,
  output,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'div[bn-alert]',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="'alert alert-' + type()" role="alert">
      <div class="alert-content">
        <ng-content></ng-content>
      </div>
      @if (dismissible()) {
        <button
          class="alert-close"
          type="button"
          aria-label="Dismiss alert"
          (click)="onDismiss()"
        >
          ✕
        </button>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .alert {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 4px;
      border-left: 4px solid;
      font-size: 0.875rem;
      line-height: 1.4;
    }

    .alert-info {
      background-color: var(--color-info-surface, #e3f2fd);
      border-left-color: var(--color-info, #2196f3);
      color: var(--color-info-text, #1565c0);
    }

    .alert-success {
      background-color: var(--color-success-surface, #e8f5e9);
      border-left-color: var(--color-success, #4caf50);
      color: var(--color-success-text, #2e7d32);
    }

    .alert-warning {
      background-color: var(--color-warning-surface, #fff3e0);
      border-left-color: var(--color-warning, #ff9800);
      color: var(--color-warning-text, #e65100);
    }

    .alert-error {
      background-color: var(--color-error-surface, #ffebee);
      border-left-color: var(--color-error, #f44336);
      color: var(--color-error-text, #c62828);
    }

    .alert-content {
      flex: 1;
    }

    .alert-close {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 32px;
      width: 32px;
      height: 32px;
      padding: 0;
      background: none;
      border: none;
      color: inherit;
      cursor: pointer;
      font-size: 1.25rem;
      line-height: 1;
      flex-shrink: 0;
      transition: opacity 0.2s ease-out;
    }

    .alert-close:hover {
      opacity: 0.7;
    }

    .alert-close:focus {
      outline: 2px solid currentColor;
      outline-offset: 2px;
    }
  `,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'bn-alert',
  },
})
export class AlertComponent {
  type = input<'info' | 'success' | 'warning' | 'error'>('info');
  dismissible = input(false);
  dismissed = output<void>();

  onDismiss(): void {
    this.dismissed.emit();
  }
}
