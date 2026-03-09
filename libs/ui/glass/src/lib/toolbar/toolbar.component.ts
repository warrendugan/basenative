import { Component, ViewEncapsulation, input } from '@angular/core';

@Component({
  selector: 'div[toolbar], section[toolbar]',
  host: {
    role: 'toolbar',
    '[attr.aria-orientation]': 'orientation()',
    '[attr.aria-disabled]': 'disabled() || null',
  },
  template: '<ng-content />',
  styleUrl: './toolbar.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class ToolbarComponent {
  orientation = input<'horizontal' | 'vertical'>('horizontal');
  disabled = input(false);
}
