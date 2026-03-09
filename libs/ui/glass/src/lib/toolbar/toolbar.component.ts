import { Toolbar } from '@angular/aria/toolbar';
import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'div[toolbar], section[toolbar]', // Attribute selector for easy usage

  hostDirectives: [
    {
      directive: Toolbar,
      inputs: ['orientation', 'disabled'],
      outputs: ['valuesChange'],
    },
  ],
  host: {
    class: 'glass-toolbar',
  },
  template: '<ng-content />',
  styleUrl: './toolbar.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class ToolbarComponent {}
