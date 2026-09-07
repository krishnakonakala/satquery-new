/**
 * SATQUERY AI — GSAP Scientific Motion & Spatial Transitions
 * Respects prefers-reduced-motion and provides unified timing curves
 * for Earth observation workstations.
 */

import gsap from 'gsap';

export function isReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export const gsapTransitions = {
  /**
   * Staggered entrance for the spatial command center
   */
  commandCenterEnter: (container: HTMLElement | null) => {
    if (!container || isReducedMotion()) return;
    gsap.fromTo(
      container.querySelectorAll('.gsap-enter'),
      { opacity: 0, y: 16, scale: 0.99 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.65,
        stagger: 0.08,
        ease: 'power2.out',
      }
    );
  },

  /**
   * Spatial map flight transition indicator
   */
  mapFlyTo: (mapElement: HTMLElement | null, onComplete?: () => void) => {
    if (!mapElement || isReducedMotion()) {
      onComplete?.();
      return;
    }
    gsap.fromTo(
      mapElement,
      { filter: 'brightness(0.96) saturate(1.05)' },
      {
        filter: 'brightness(1) saturate(1)',
        duration: 0.75,
        ease: 'power1.out',
        onComplete,
      }
    );
  },

  /**
   * Reveal new satellite observation telemetry and raster preview
   */
  observationReveal: (cardElement: HTMLElement | null) => {
    if (!cardElement || isReducedMotion()) return;
    gsap.fromTo(
      cardElement,
      { opacity: 0, scale: 0.97, y: 12 },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.5,
        ease: 'back.out(1.2)',
      }
    );
  },

  /**
   * Scientific execution pipeline starting sequence
   */
  analysisStart: (pipelineElement: HTMLElement | null) => {
    if (!pipelineElement || isReducedMotion()) return;
    gsap.fromTo(
      pipelineElement,
      { opacity: 0, y: -8 },
      { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
    );
  },

  /**
   * Pulse/advance active scientific processing stage
   */
  analysisStage: (stageElement: HTMLElement | null) => {
    if (!stageElement || isReducedMotion()) return;
    gsap.fromTo(
      stageElement,
      { scale: 0.95, borderColor: '#0284c7' },
      { scale: 1, borderColor: '#059669', duration: 0.45, ease: 'power2.out' }
    );
  },

  /**
   * Reveal structured evidence card connected to coordinate region
   */
  evidenceReveal: (elements: HTMLElement[] | NodeListOf<HTMLElement>) => {
    if (!elements || isReducedMotion()) return;
    gsap.fromTo(
      elements,
      { opacity: 0, x: 20 },
      {
        opacity: 1,
        x: 0,
        duration: 0.45,
        stagger: 0.1,
        ease: 'power2.out',
      }
    );
  },

  /**
   * Sequential reveal for SatQuery scientific finding
   */
  resultReveal: (container: HTMLElement | null) => {
    if (!container || isReducedMotion()) return;
    const items = container.querySelectorAll('.gsap-result-item');
    gsap.fromTo(
      items,
      { opacity: 0, y: 14 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.12,
        ease: 'power2.out',
      }
    );
  },

  /**
   * Panel expansion with smooth spring
   */
  panelExpand: (panel: HTMLElement | null) => {
    if (!panel || isReducedMotion()) return;
    gsap.fromTo(
      panel,
      { height: 0, opacity: 0 },
      { height: 'auto', opacity: 1, duration: 0.4, ease: 'power2.out' }
    );
  },

  /**
   * Temporal scrubber update indicator
   */
  timelineScrub: (marker: HTMLElement | null) => {
    if (!marker || isReducedMotion()) return;
    gsap.fromTo(
      marker,
      { scale: 1.4 },
      { scale: 1, duration: 0.35, ease: 'elastic.out(1, 0.4)' }
    );
  },
};
