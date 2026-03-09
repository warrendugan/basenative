/**
 * UX Laws as CSS Custom Properties
 *
 * Generates a CSS string that can be injected into :root
 * or applied via a style element. This ensures the laws
 * are available to every component's stylesheet.
 *
 * Components reference these tokens directly:
 *   button { min-height: var(--ux-fitts-min-target); }
 *   .transition { transition-duration: var(--ux-aesthetic-transition); }
 */

import {
  DOHERTY_THRESHOLD_MS,
  FITTS_MIN_TARGET_SIZE_PX,
  FITTS_MIN_TARGET_SPACING_PX,
  AESTHETIC_MIN_TRANSITION_MS,
  AESTHETIC_STANDARD_TRANSITION_MS,
  AESTHETIC_EASE_CURVE,
  PROXIMITY_RELATED_GAP_PX,
  PROXIMITY_GROUP_GAP_PX,
  PROXIMITY_SECTION_GAP_PX,
  COMMON_REGION_PADDING_PX,
  COMMON_REGION_BORDER_RADIUS_PX,
  PRAGNANZ_MAX_BORDER_RADIUS_PX,
  PEAK_END_SUCCESS_ANIMATION_MS,
} from './ux-laws.models';

export const UX_LAWS_CSS_TOKENS = `
  /* ==========================================================================
   * UX Laws — CSS Custom Properties (lawsofux.com)
   * Applied globally via BaseNative token system.
   * ========================================================================== */

  /* Fitts's Law — Minimum interactive target dimensions */
  --ux-fitts-min-target: ${FITTS_MIN_TARGET_SIZE_PX}px;
  --ux-fitts-min-spacing: ${FITTS_MIN_TARGET_SPACING_PX}px;

  /* Doherty Threshold — Max acceptable latency for perceived smoothness */
  --ux-doherty-threshold: ${DOHERTY_THRESHOLD_MS}ms;

  /* Aesthetic-Usability Effect — Animation timing */
  --ux-transition-fast: ${AESTHETIC_MIN_TRANSITION_MS}ms;
  --ux-transition-base: ${AESTHETIC_STANDARD_TRANSITION_MS}ms;
  --ux-ease: ${AESTHETIC_EASE_CURVE};

  /* Peak-End Rule — Success state animation */
  --ux-success-duration: ${PEAK_END_SUCCESS_ANIMATION_MS}ms;

  /* Law of Proximity — Spacing scale */
  --ux-gap-related: ${PROXIMITY_RELATED_GAP_PX}px;
  --ux-gap-group: ${PROXIMITY_GROUP_GAP_PX}px;
  --ux-gap-section: ${PROXIMITY_SECTION_GAP_PX}px;

  /* Law of Common Region — Container defaults */
  --ux-region-padding: ${COMMON_REGION_PADDING_PX}px;
  --ux-region-radius: ${COMMON_REGION_BORDER_RADIUS_PX}px;

  /* Law of Prägnanz — Simplicity constraints */
  --ux-max-radius: ${PRAGNANZ_MAX_BORDER_RADIUS_PX}px;
` as const;

/**
 * Injects UX law CSS tokens into the document root.
 * Call once at application bootstrap.
 */
export function injectUxLawsTokens(document: Document): void {
  const style = document.createElement('style');
  style.setAttribute('data-basenative', 'ux-laws');
  style.textContent = `:root { ${UX_LAWS_CSS_TOKENS} }`;
  document.head.appendChild(style);
}
