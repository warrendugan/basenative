import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';

@Component({
  selector: 'glass-shadow-editor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shadow-editor.component.html',
  styleUrl: './shadow-editor.component.css',
})
export class ShadowEditorComponent {
  readonly uid = 'shadow-' + Math.random().toString(36).slice(2, 9);
  @Input() set value(v: string) {
    this.parse(v);
  }
  @Output() valueChange = new EventEmitter<string>();

  x = signal(0);
  y = signal(0);
  blur = signal(0);
  spread = signal(0);
  color = signal('#000000');
  opacity = signal(0.3); // Extract opacity if possible

  // Flag to prevent loop
  private isUpdating = false;

  parse(val: string) {
    if (this.isUpdating) return;
    // Basic parser for "0 8px 32px 0 rgba(0, 0, 0, 0.3)"
    // This is fragile but works for the specific format in tokens
    const parts = val.trim().split(/\s+(?![^(]*\))/); // split by space ignoring inside parens

    if (parts.length >= 4) {
      this.x.set(parseInt(parts[0]));
      this.y.set(parseInt(parts[1]));
      this.blur.set(parseInt(parts[2]));
      this.spread.set(parseInt(parts[3]));

      const colorStr = parts.slice(4).join(' '); // rest is color

      // Try to extract rgba
      const rgbaMatch = colorStr.match(
        /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/,
      );
      if (rgbaMatch) {
        const r = parseInt(rgbaMatch[1]);
        const g = parseInt(rgbaMatch[2]);
        const b = parseInt(rgbaMatch[3]);
        const a = rgbaMatch[4] ? parseFloat(rgbaMatch[4]) : 1;

        this.color.set(this.rgbToHex(r, g, b));
        this.opacity.set(a);
      } else {
        this.color.set(colorStr); // fallback
      }
    }
  }

  update() {
    this.isUpdating = true;
    const r = parseInt(this.color().slice(1, 3), 16);
    const g = parseInt(this.color().slice(3, 5), 16);
    const b = parseInt(this.color().slice(5, 7), 16);

    const colorStr = `rgba(${r}, ${g}, ${b}, ${this.opacity()})`;
    const newVal = `${this.x()}px ${this.y()}px ${this.blur()}px ${this.spread()}px ${colorStr}`;

    this.valueChange.emit(newVal);
    this.isUpdating = false;
  }

  rgbToHex(r: number, g: number, b: number) {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  onInput(type: 'x' | 'y' | 'blur' | 'spread' | 'opacity', event: Event) {
    const target = event.target as HTMLInputElement;
    const val = parseFloat(target.value);
    switch (type) {
      case 'x':
        this.x.set(val);
        break;
      case 'y':
        this.y.set(val);
        break;
      case 'blur':
        this.blur.set(val);
        break;
      case 'spread':
        this.spread.set(val);
        break;
      case 'opacity':
        this.opacity.set(val);
        break;
    }
    this.update();
  }

  onColorInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.color.set(target.value);
    this.update();
  }
}
