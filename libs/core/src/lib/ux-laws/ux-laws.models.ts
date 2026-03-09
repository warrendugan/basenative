/**
 * Laws of UX — Codified Design Constraints
 *
 * Based on Jon Yablonski's Laws of UX (lawsofux.com).
 * These are not just guidelines — they are programmatic constraints
 * enforced across the BaseNative ecosystem.
 *
 * Every component in BaseNative should reference these constants
 * rather than hardcoding magic numbers.
 */

// ---------------------------------------------------------------------------
// Heuristics
// ---------------------------------------------------------------------------

/**
 * Doherty Threshold
 * Productivity soars when a computer and its user interact at a pace
 * (<400ms) that ensures neither has to wait on the other.
 */
export const DOHERTY_THRESHOLD_MS = 400 as const;

/**
 * Fitts's Law
 * The time to acquire a target is a function of the distance to
 * and size of the target. Minimum touch targets prevent mis-taps.
 */
export const FITTS_MIN_TARGET_SIZE_PX = 44 as const;
export const FITTS_MIN_TARGET_SPACING_PX = 8 as const;

/**
 * Hick's Law
 * Decision time increases logarithmically with the number of choices.
 * Cap visible options; overflow into progressive disclosure.
 */
export const HICKS_MAX_VISIBLE_OPTIONS = 7 as const;
export const HICKS_PROGRESSIVE_DISCLOSURE_THRESHOLD = 5 as const;

/**
 * Miller's Law
 * Working memory holds 7 ± 2 items. Chunk information accordingly.
 */
export const MILLER_CHUNK_SIZE = 7 as const;
export const MILLER_MIN_CHUNK = 5 as const;
export const MILLER_MAX_CHUNK = 9 as const;

/**
 * Jakob's Law
 * Users spend most of their time on other sites. Match conventions.
 * Encoded as semantic role constants for consistent affordances.
 */
export const JAKOBS_CONVENTIONS = {
  primaryAction: 'bottom-right',
  cancelAction: 'left-of-primary',
  navigationPlacement: 'left-sidebar-or-top-bar',
  searchPlacement: 'top-center-or-top-right',
  logoPlacement: 'top-left',
  logoLinksTo: '/',
} as const;

/**
 * Goal-Gradient Effect
 * Users accelerate behavior as they near a goal.
 * Always show progress indicators for multi-step flows.
 */
export const GOAL_GRADIENT_SHOW_PROGRESS_AFTER_STEPS = 2 as const;

/**
 * Peak-End Rule
 * Experiences are judged by their peak and end moments.
 * Final steps and success states deserve extra polish.
 */
export const PEAK_END_SUCCESS_ANIMATION_MS = 600 as const;

/**
 * Parkinson's Law
 * Tasks expand to fill available time.
 * Use constraints (character limits, deadlines) to drive completion.
 */
export const PARKINSONS_DEFAULT_FORM_TIMEOUT_MINUTES = 30 as const;

/**
 * Postel's Law (Robustness Principle)
 * Be liberal in what you accept, conservative in what you send.
 * Inputs should accept flexible formats; outputs should be strict.
 */
export const POSTELS_PHONE_PATTERNS = [
  /^\+?1?\s*\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/,
  /^[0-9]{10}$/,
  /^\([0-9]{3}\)\s?[0-9]{3}-[0-9]{4}$/,
] as const;

/**
 * Aesthetic-Usability Effect
 * Users perceive aesthetically pleasing designs as more usable.
 * Minimum animation durations for perceived smoothness.
 */
export const AESTHETIC_MIN_TRANSITION_MS = 150 as const;
export const AESTHETIC_STANDARD_TRANSITION_MS = 250 as const;
export const AESTHETIC_EASE_CURVE = 'cubic-bezier(0.4, 0, 0.2, 1)' as const;

// ---------------------------------------------------------------------------
// Gestalt Principles
// ---------------------------------------------------------------------------

/**
 * Law of Proximity
 * Related elements should be close; unrelated elements should have space.
 */
export const PROXIMITY_RELATED_GAP_PX = 8 as const;
export const PROXIMITY_SECTION_GAP_PX = 24 as const;
export const PROXIMITY_GROUP_GAP_PX = 16 as const;

/**
 * Law of Common Region
 * Elements in the same bounded region are perceived as grouped.
 * Use containers (cards, sections) to create visual regions.
 */
export const COMMON_REGION_PADDING_PX = 16 as const;
export const COMMON_REGION_BORDER_RADIUS_PX = 8 as const;

/**
 * Law of Similarity
 * Similar-looking elements are perceived as related.
 * Consistent component variants signal consistent behavior.
 */
export type SemanticVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

/**
 * Law of Prägnanz (Simplicity)
 * People interpret ambiguous images in the simplest way possible.
 * Prefer flat, simple shapes over complex, skeuomorphic ones.
 */
export const PRAGNANZ_MAX_BORDER_RADIUS_PX = 16 as const;
export const PRAGNANZ_MAX_SHADOW_LAYERS = 2 as const;

/**
 * Law of Uniform Connectedness
 * Visually connected elements are perceived as more related.
 * Use lines, colors, or shared containers to show relationships.
 */
export const CONNECTEDNESS_LINE_WIDTH_PX = 1 as const;

// ---------------------------------------------------------------------------
// Cognitive Biases
// ---------------------------------------------------------------------------

/**
 * Serial Position Effect
 * Users remember the first and last items in a series best.
 * Place the most important actions at the start and end of lists.
 */
export const SERIAL_POSITION_HIGHLIGHT_FIRST = true as const;
export const SERIAL_POSITION_HIGHLIGHT_LAST = true as const;

/**
 * Von Restorff Effect (Isolation Effect)
 * A distinctive item among similar items is more memorable.
 * Use accent colors/sizes for primary CTAs.
 */
export const VON_RESTORFF_CTA_SCALE_FACTOR = 1.1 as const;

/**
 * Zeigarnik Effect
 * Incomplete tasks are remembered better than completed ones.
 * Show progress, draft states, and incomplete indicators.
 */
export const ZEIGARNIK_SHOW_INCOMPLETE_BADGE = true as const;

// ---------------------------------------------------------------------------
// Principles
// ---------------------------------------------------------------------------

/**
 * Tesler's Law (Conservation of Complexity)
 * Every system has irreducible complexity. The question is
 * whether the user or the system bears it.
 * Prefer pushing complexity into the system (smart defaults,
 * auto-detection, inference) over exposing it to the user.
 */
export const TESLERS_SMART_DEFAULTS = true as const;

/**
 * Pareto Principle
 * 80% of effects come from 20% of causes.
 * Optimize the critical 20% of interactions first.
 */
export const PARETO_CRITICAL_PATH_RATIO = 0.2 as const;
