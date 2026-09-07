/**
 * SATQUERY AI — Scientific Cursor Event Bus
 * Dispatches lightweight custom events for analysis status without React re-render thrash.
 */

export type CursorAnalysisEvent = 'start' | 'complete' | 'error';

export function emitCursorAnalysisStart() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('satquery:cursor-analysis-start'));
  }
}

export function emitCursorAnalysisComplete() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('satquery:cursor-analysis-complete'));
  }
}

export function emitCursorAnalysisError() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('satquery:cursor-analysis-error'));
  }
}
