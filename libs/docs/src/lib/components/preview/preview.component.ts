import {
  Component,
  input,
  signal,
  ChangeDetectionStrategy,
  ViewEncapsulation,
} from '@angular/core';

import {
  ButtonComponent,
  IconComponent,
  LogoComponent,
  ThemeSelectorComponent,
} from '@basenative/ui-glass';
import {
  CardComponent,
  CardHeaderDirective,
  CardContentDirective,
  CardFooterDirective,
  ListComponent,
  ListItemComponent,
} from '@basenative/layout';
import { InputComponent, InputDirective } from '@basenative/forms';
import { VisuallyHiddenComponent } from '@basenative/primitives-a11y';
import { FocusTrapDirective } from '@basenative/primitives-focus';
import { Anchor, Anchored } from '@basenative/primitives-anchor';
import { PortalDirective } from '@basenative/primitives-portal';
import { DialogComponent } from '@basenative/primitives-dialog';
import { ScrollDirective } from '@basenative/primitives-scroll';

@Component({
  selector: 'docs-preview',
  standalone: true,
  imports: [
    ButtonComponent,
    IconComponent,
    LogoComponent,
    ThemeSelectorComponent,
    CardComponent,
    CardHeaderDirective,
    CardContentDirective,
    CardFooterDirective,
    ListComponent,
    ListItemComponent,
    InputComponent,
    InputDirective,
    VisuallyHiddenComponent,
    FocusTrapDirective,
    Anchor,
    Anchored,
    PortalDirective,
    DialogComponent,
    ScrollDirective,
  ],
  templateUrl: './preview.component.html',
  styleUrl: './preview.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PreviewComponent {
  component = input.required<string>();

  // --- Canvas Logic ---
  scale = signal(1);
  pan = signal({ x: 0, y: 0 });
  isDragging = false;
  dragStart = { x: 0, y: 0 };

  startDrag(event: MouseEvent) {
    // Check if clicking inside a focus trap or something that needs interaction
    if (
      (event.target as HTMLElement).closest('button, input, [role="button"]')
    ) {
      return;
    }

    this.isDragging = true;
    this.dragStart = {
      x: event.clientX - this.pan().x,
      y: event.clientY - this.pan().y,
    };
    event.preventDefault(); // Prevent text selection
  }

  onDrag(event: MouseEvent) {
    if (!this.isDragging) return;
    this.pan.set({
      x: event.clientX - this.dragStart.x,
      y: event.clientY - this.dragStart.y,
    });
  }

  endDrag() {
    this.isDragging = false;
  }

  zoomIn() {
    this.scale.update((s) => Math.min(s + 0.1, 3));
  }

  zoomOut() {
    this.scale.update((s) => Math.max(s - 0.1, 0.5));
  }

  resetView() {
    this.scale.set(1);
    this.pan.set({ x: 0, y: 0 });
  }
}
