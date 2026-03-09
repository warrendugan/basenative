import { Component, signal } from '@angular/core';
import {
  FeatureLayoutComponent,
  ButtonComponent,
  IconComponent,
} from '@basenative/ui-glass';

@Component({
  selector: 'section[desktop-page]',
  standalone: true,
  imports: [FeatureLayoutComponent, ButtonComponent, IconComponent],
  templateUrl: './desktop.component.html',
  styleUrl: './desktop.component.css',
})
export class DesktopComponent {
  pastedContent = signal('');

  async copy(text: string) {
    if (!text) return;
    await navigator.clipboard.writeText(text);
  }

  async paste() {
    try {
      const text = await navigator.clipboard.readText();
      this.pastedContent.set(text);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to read clipboard', err);
    }
  }

  requestPermission() {
    Notification.requestPermission();
  }

  notify() {
    if (Notification.permission === 'granted') {
      new Notification('BaseNative', {
        body: 'This is a native system notification!',
      });
    }
  }
}
