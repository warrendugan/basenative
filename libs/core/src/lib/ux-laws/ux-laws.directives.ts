/**
 * UX Law Directives — Declarative enforcement in templates.
 *
 * Apply these directives to components in development mode
 * to get console warnings when UX laws are violated.
 *
 * Usage:
 *   <button bn uxFittsCheck>Submit</button>
 *   <ul [uxHicksCheck]="options.length">...</ul>
 */

import {
  Directive,
  ElementRef,
  afterNextRender,
  inject,
  input,
} from '@angular/core';

import { assertMinTargetSize, assertOptionCount, assertChunkSize } from './ux-laws.validators';

/**
 * Fitts's Law — Validates minimum touch target size after render.
 *
 * ```html
 * <button bn uxFittsCheck>Submit</button>
 * ```
 */
@Directive({
  selector: '[uxFittsCheck]',
  standalone: true,
})
export class UxFittsCheckDirective {
  private readonly el = inject(ElementRef<HTMLElement>);
  readonly context = input<string>('', { alias: 'uxFittsCheck' });

  constructor() {
    afterNextRender(() => {
      assertMinTargetSize(this.el.nativeElement, this.context() || undefined);
    });
  }
}

/**
 * Hick's Law — Warns when too many options are displayed.
 *
 * ```html
 * <select [uxHicksCheck]="options.length">...</select>
 * ```
 */
@Directive({
  selector: '[uxHicksCheck]',
  standalone: true,
})
export class UxHicksCheckDirective {
  readonly count = input.required<number>({ alias: 'uxHicksCheck' });
  readonly context = input<string>('');

  constructor() {
    afterNextRender(() => {
      assertOptionCount(this.count(), this.context() || undefined);
    });
  }
}

/**
 * Miller's Law — Warns when a list exceeds working memory limits.
 *
 * ```html
 * <nav [uxMillerCheck]="navItems.length">...</nav>
 * ```
 */
@Directive({
  selector: '[uxMillerCheck]',
  standalone: true,
})
export class UxMillerCheckDirective {
  readonly count = input.required<number>({ alias: 'uxMillerCheck' });
  readonly context = input<string>('');

  constructor() {
    afterNextRender(() => {
      assertChunkSize(this.count(), this.context() || undefined);
    });
  }
}
