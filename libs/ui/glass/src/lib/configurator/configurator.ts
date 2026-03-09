import { CommonModule, TitleCasePipe } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { InputComponent } from '@basenative/forms';
import { ThemeService, tokens } from '@basenative/tokens';
import { ButtonComponent } from '../button/button.component';
import { OpenGraphPreviewComponent } from '../open-graph-preview/open-graph-preview.component';
import { ShadowEditorComponent } from '../shadow-editor/shadow-editor.component';

@Component({
  selector: 'section[configurator]',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    InputComponent,
    OpenGraphPreviewComponent,
    ShadowEditorComponent,
    TitleCasePipe,
  ],
  templateUrl: './configurator.html',
  styleUrl: './configurator.css',
})
export class Configurator {
  theme = inject(ThemeService);
  protected Object = Object;

  // View Configuration
  showSidebar = input(true);
  showPreviews = input(true);

  // Asset Configuration
  logoUrl = signal('assets/logo.svg');
  faviconUrl = signal('assets/logo.svg');
  appTitle = signal('BaseNative App');

  // Open Graph Configuration
  ogTitle = signal('BaseNative - Modern Angular Components');
  ogDescription = signal(
    'A glassmorphism-first component library for high-end web applications.',
  );
  ogImage = signal('assets/logo.svg');
  ogUrl = signal('https://basenative.com');

  // Display Order Validation
  groupOrder = [
    'brand',
    'surface',
    'typography',
    'border',
    'syntax',
    'shadow',
    'blur',
    'radius',
    'space',
    'z-index',
  ];

  // Flatten tokens for display with SMART GROUPING
  flatTokens = computed(() => {
    const groups: Record<
      string,
      { name: string; value: string; type: string; cssVar: string }[]
    > = {};

    // Helper to traverse
    const traverse = (obj: Record<string, unknown>, prefix = '--') => {
      for (const key in obj) {
        if (key.startsWith('$')) continue;
        const val = obj[key] as Record<string, unknown>;
        const name = `${prefix}${prefix === '--' ? '' : '-'}${this.camelToKebab(key)}`;

        if (val && typeof val === 'object' && '$value' in val) {
          // Smart Grouping Logic
          let groupName = 'other';

          if (name.includes('color-primary')) groupName = 'brand';
          else if (name.includes('color-surface')) groupName = 'surface';
          else if (name.includes('color-text') || name.includes('typography'))
            groupName = 'typography';
          else if (name.includes('color-border')) groupName = 'border';
          else if (name.includes('color-syntax') || name.includes('pattern'))
            groupName = 'syntax';
          else if (name.includes('shadow')) groupName = 'shadow';
          else if (name.includes('blur')) groupName = 'blur';
          else if (name.includes('space')) groupName = 'space';
          else if (name.includes('radius')) groupName = 'radius';
          else if (name.includes('z-index')) groupName = 'z-index';

          if (!groups[groupName]) groups[groupName] = [];

          groups[groupName].push({
            name: name,
            value: val['$value'] as string,
            type: val['$type'] as string,
            cssVar: name,
          });
        } else if (val && typeof val === 'object') {
          traverse(val, name);
        }
      }
    };

    traverse(tokens as Record<string, unknown>);
    return groups;
  });

  // Helper for rendering loops in specific order
  getOrderedGroups() {
    return this.groupOrder.filter((g) => this.flatTokens()[g]);
  }

  camelToKebab(str: string) {
    return str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
  }

  update(cssVar: string, event: Event) {
    const target = event.target as HTMLInputElement;
    this.theme.updateToken(cssVar, target.value);
  }

  // Helper to convert any CSS color (oklch, rgb, var, named) to Hex for input[type=color]
  getHexValue(cssValue: string): string {
    if (!cssValue) return '#000000';
    if (cssValue.startsWith('#') && cssValue.length === 7) return cssValue;

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext('2d');
      if (!ctx) return '#000000';

      ctx.fillStyle = cssValue;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;

      return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    } catch {
      return '#000000';
    }
  }
}
