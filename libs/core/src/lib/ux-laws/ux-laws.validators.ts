/**
 * UX Law Validators — Runtime enforcement of design constraints.
 *
 * These functions can be called in development mode to warn when
 * components violate Laws of UX principles. Use them in `effect()`
 * blocks or as Angular CDK-style dev-mode checks.
 */

import {
  DOHERTY_THRESHOLD_MS,
  FITTS_MIN_TARGET_SIZE_PX,
  FITTS_MIN_TARGET_SPACING_PX,
  HICKS_MAX_VISIBLE_OPTIONS,
  MILLER_MAX_CHUNK,
} from './ux-laws.models';

const isDev = typeof ngDevMode === 'undefined' || ngDevMode;

function warn(law: string, message: string): void {
  if (isDev) {
    console.warn(`[BaseNative/${law}] ${message}`);
  }
}

/**
 * Fitts's Law: Warn if an interactive element is too small.
 */
export function assertMinTargetSize(
  element: HTMLElement,
  context?: string
): void {
  if (!isDev) return;
  const rect = element.getBoundingClientRect();
  const label = context ?? element.tagName.toLowerCase();

  if (rect.width < FITTS_MIN_TARGET_SIZE_PX || rect.height < FITTS_MIN_TARGET_SIZE_PX) {
    warn(
      "Fitts's Law",
      `"${label}" target is ${Math.round(rect.width)}×${Math.round(rect.height)}px. ` +
      `Minimum touch target is ${FITTS_MIN_TARGET_SIZE_PX}×${FITTS_MIN_TARGET_SIZE_PX}px.`
    );
  }
}

/**
 * Hick's Law: Warn if too many options are presented at once.
 */
export function assertOptionCount(
  count: number,
  context?: string
): void {
  if (!isDev) return;
  const label = context ?? 'Component';

  if (count > HICKS_MAX_VISIBLE_OPTIONS) {
    warn(
      "Hick's Law",
      `"${label}" presents ${count} options. Consider progressive disclosure ` +
      `(search, categories, or "show more") when exceeding ${HICKS_MAX_VISIBLE_OPTIONS} items.`
    );
  }
}

/**
 * Miller's Law: Warn if information chunks exceed working memory limits.
 */
export function assertChunkSize(
  count: number,
  context?: string
): void {
  if (!isDev) return;
  const label = context ?? 'Component';

  if (count > MILLER_MAX_CHUNK) {
    warn(
      "Miller's Law",
      `"${label}" has ${count} items in a single group. ` +
      `Working memory holds 7±2 items. Consider chunking into sub-groups.`
    );
  }
}

/**
 * Doherty Threshold: Measure operation latency and warn if too slow.
 * Returns a function to call when the operation completes.
 */
export function measureLatency(
  operationName: string
): () => void {
  if (!isDev) return () => {};
  const start = performance.now();

  return () => {
    const elapsed = performance.now() - start;
    if (elapsed > DOHERTY_THRESHOLD_MS) {
      warn(
        'Doherty Threshold',
        `"${operationName}" took ${Math.round(elapsed)}ms. ` +
        `Users perceive delays over ${DOHERTY_THRESHOLD_MS}ms as sluggish. ` +
        `Add a loading indicator or optimistic UI.`
      );
    }
  };
}

/**
 * Fitts's Law: Warn if two interactive elements are too close together.
 */
export function assertTargetSpacing(
  elementA: HTMLElement,
  elementB: HTMLElement,
  context?: string
): void {
  if (!isDev) return;
  const rectA = elementA.getBoundingClientRect();
  const rectB = elementB.getBoundingClientRect();

  const horizontalGap = Math.abs(rectB.left - rectA.right);
  const verticalGap = Math.abs(rectB.top - rectA.bottom);
  const gap = Math.min(horizontalGap, verticalGap);

  if (gap < FITTS_MIN_TARGET_SPACING_PX && gap >= 0) {
    warn(
      "Fitts's Law",
      `${context ?? 'Elements'} are ${Math.round(gap)}px apart. ` +
      `Minimum spacing is ${FITTS_MIN_TARGET_SPACING_PX}px to prevent mis-taps.`
    );
  }
}

declare const ngDevMode: boolean | undefined;
