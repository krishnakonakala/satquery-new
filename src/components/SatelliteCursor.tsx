/**
 * SATQUERY AI — Premium Scientific Satellite Cursor
 * Aerospace instrument style:
 * - Tiny satellite silhouette with solar arrays & telemetry antenna
 * - High-precision tracking reticle / crosshairs
 * - 180ms smoothed orbital follow delay via GSAP ticker / RAF
 * - Dynamic context adaptation: Map Tracking, Pixel Inspect, Divider Resize, Action Pointer, Radar Scan
 * - Strict zero-render mouse tracking (DOM refs + GSAP ticker)
 * - Accessibility: full prefers-reduced-motion compliance
 */

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

type CursorMode = 'default' | 'map' | 'image' | 'divider' | 'button' | 'analyze' | 'analyzing' | 'confirm';

export const SatelliteCursor: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const targetDotRef = useRef<HTMLDivElement>(null);
  const satelliteRef = useRef<HTMLDivElement>(null);
  const orbitalArcRef = useRef<SVGPathElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const radarSweepRef = useRef<HTMLDivElement>(null);
  const trailCanvasRef = useRef<HTMLCanvasElement>(null);

  // Position coordinates held in refs (ZERO React re-renders on mouse movement)
  const mousePos = useRef<{ x: number; y: number }>({ x: -200, y: -200 });
  const satPos = useRef<{ x: number; y: number }>({ x: -200, y: -200 });
  const currentMode = useRef<CursorMode>('default');
  const isVisible = useRef<boolean>(false);
  const rotationAngle = useRef<number>(-25);
  const isAnalyzing = useRef<boolean>(false);

  // Recent position history for short trail
  const trailHistory = useRef<{ x: number; y: number; alpha: number }[]>([]);

  useEffect(() => {
    // Check reduced motion
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reducedMotionQuery.matches) {
      // Respect accessibility: do not mount custom cursor
      return;
    }

    const container = containerRef.current;
    const targetDot = targetDotRef.current;
    const satellite = satelliteRef.current;
    const badge = badgeRef.current;
    const radarSweep = radarSweepRef.current;
    const trailCanvas = trailCanvasRef.current;

    if (!container || !targetDot || !satellite) return;

    // Resize trail canvas
    const handleResize = () => {
      if (trailCanvas) {
        trailCanvas.width = window.innerWidth;
        trailCanvas.height = window.innerHeight;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const updateBadgeText = (text: string, show: boolean, colorClass?: string) => {
      if (!badge) return;
      if (!show) {
        badge.style.opacity = '0';
        badge.style.transform = 'translateY(4px)';
      } else {
        badge.textContent = text;
        badge.style.opacity = '1';
        badge.style.transform = 'translateY(0px)';
      }
    };

    // Global mousemove handler
    const onMouseMove = (e: MouseEvent) => {
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;

      if (!isVisible.current) {
        isVisible.current = true;
        satPos.current.x = e.clientX - 22;
        satPos.current.y = e.clientY - 24;
        container.style.opacity = '1';
      }

      // Add to trail history
      trailHistory.current.unshift({ x: e.clientX, y: e.clientY, alpha: 0.6 });
      if (trailHistory.current.length > 8) {
        trailHistory.current.pop();
      }

      // Detect Context from target
      if (isAnalyzing.current) {
        currentMode.current = 'analyzing';
        return;
      }

      const target = e.target as HTMLElement | null;
      if (!target) return;

      const isDivider = target.closest('[data-cursor="divider"], .comparison-divider');
      const isMap = target.closest('[data-cursor="map"], .leaflet-container, #earth-map');
      const isImage = target.closest('[data-cursor="image"], .comparison-viewport, .raster-stage');
      const isAnalyzeBtn = target.closest('[data-cursor="analyze"], button[data-action="analyze"]');
      const isBtn = target.closest('button, a, input, select, [role="button"], label.cursor-pointer');

      if (isDivider) {
        currentMode.current = 'divider';
        updateBadgeText('↔ RESIZE', true);
      } else if (isAnalyzeBtn) {
        currentMode.current = 'analyze';
        updateBadgeText('SCAN RADAR', true);
      } else if (isMap) {
        currentMode.current = 'map';
        updateBadgeText('SATELLITE TRACKING', true);
      } else if (isImage) {
        currentMode.current = 'image';
        updateBadgeText('PIXEL INSPECT', true);
      } else if (isBtn) {
        currentMode.current = 'button';
        updateBadgeText('', false);
      } else {
        currentMode.current = 'default';
        updateBadgeText('', false);
      }
    };

    const onMouseLeave = () => {
      isVisible.current = false;
      container.style.opacity = '0';
    };

    const onMouseEnter = () => {
      isVisible.current = true;
      container.style.opacity = '1';
    };

    // Analysis event listeners
    const onAnalysisStart = () => {
      isAnalyzing.current = true;
      currentMode.current = 'analyzing';
      updateBadgeText('ORBITAL SCAN ACTIVE', true);
    };

    const onAnalysisComplete = () => {
      isAnalyzing.current = false;
      currentMode.current = 'confirm';
      updateBadgeText('ACQUISITION VERIFIED ✓', true);

      // Micro pulse on satellite
      if (satellite) {
        gsap.fromTo(
          satellite,
          { scale: 1.3, filter: 'drop-shadow(0 0 10px #10b981)' },
          { scale: 1, filter: 'drop-shadow(0 0 2px rgba(15,23,42,0.3))', duration: 0.6, ease: 'back.out(2)' }
        );
      }

      setTimeout(() => {
        if (currentMode.current === 'confirm') {
          currentMode.current = 'default';
          updateBadgeText('', false);
        }
      }, 1200);
    };

    const onAnalysisError = () => {
      isAnalyzing.current = false;
      currentMode.current = 'default';
      updateBadgeText('', false);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);
    window.addEventListener('satquery:cursor-analysis-start', onAnalysisStart);
    window.addEventListener('satquery:cursor-analysis-complete', onAnalysisComplete);
    window.addEventListener('satquery:cursor-analysis-error', onAnalysisError);

    // GSAP Ticker for smooth 60fps interpolation and trail rendering
    let scanAngle = 0;
    const tickerCallback = () => {
      if (!isVisible.current) return;

      const targetX = mousePos.current.x;
      const targetY = mousePos.current.y;

      // Reticle moves directly with mouse
      targetDot.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`;

      // Satellite follows with smooth 180-220ms lag
      const dx = targetX - (satPos.current.x + 22);
      const dy = targetY - (satPos.current.y + 24);

      satPos.current.x += dx * 0.16;
      satPos.current.y += dy * 0.16;

      // Dynamic orbital tilt based on movement vector
      const speed = Math.sqrt(dx * dx + dy * dy);
      if (speed > 1) {
        const targetAngle = Math.atan2(dy, dx) * (180 / Math.PI) - 90;
        rotationAngle.current += (targetAngle - rotationAngle.current) * 0.1;
      }

      // Orbital scan animation during analysis or analyze button hover
      if (currentMode.current === 'analyzing' || currentMode.current === 'analyze') {
        scanAngle += 4.5;
        if (radarSweep) {
          radarSweep.style.transform = `rotate(${scanAngle}deg)`;
          radarSweep.style.opacity = '0.9';
        }
      } else {
        if (radarSweep) radarSweep.style.opacity = '0';
      }

      // Mode-specific transforms & styles
      let satScale = 1;
      let satOpacity = 0.95;

      if (currentMode.current === 'button') {
        satScale = 0.78;
        satOpacity = 0.75;
      } else if (currentMode.current === 'divider') {
        satScale = 0.85;
      } else if (currentMode.current === 'analyzing') {
        satScale = 1.15;
      }

      satellite.style.transform = `translate3d(${satPos.current.x}px, ${satPos.current.y}px, 0) rotate(${rotationAngle.current}deg) scale(${satScale})`;
      satellite.style.opacity = satOpacity.toString();

      // Render faint fast-decaying trail on canvas
      if (trailCanvas) {
        const ctx = trailCanvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
          if (trailHistory.current.length > 1) {
            ctx.beginPath();
            ctx.moveTo(trailHistory.current[0].x, trailHistory.current[0].y);
            for (let i = 1; i < trailHistory.current.length; i++) {
              ctx.lineTo(trailHistory.current[i].x, trailHistory.current[i].y);
            }
            ctx.strokeStyle = currentMode.current === 'confirm' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(2, 132, 199, 0.18)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Decay alphas
            for (let i = 0; i < trailHistory.current.length; i++) {
              trailHistory.current[i].alpha *= 0.75;
            }
          }
        }
      }
    };

    gsap.ticker.add(tickerCallback);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      window.removeEventListener('satquery:cursor-analysis-start', onAnalysisStart);
      window.removeEventListener('satquery:cursor-analysis-complete', onAnalysisComplete);
      window.removeEventListener('satquery:cursor-analysis-error', onAnalysisError);
      gsap.ticker.remove(tickerCallback);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-[99999] overflow-hidden transition-opacity duration-300 opacity-0 select-none"
      aria-hidden="true"
    >
      {/* Short faint orbital trail canvas */}
      <canvas ref={trailCanvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Primary Instrument Reticle (at exact cursor location) */}
      <div
        ref={targetDotRef}
        className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center will-change-transform"
      >
        {/* Central precision dot */}
        <div className="w-2 h-2 rounded-full bg-slate-900 border border-white shadow-xs" />

        {/* 4 aerospace optical tick marks */}
        <div className="absolute w-4 h-[1px] bg-sky-600/70" />
        <div className="absolute h-4 w-[1px] bg-sky-600/70" />

        {/* Outer tracking ring */}
        <div className="absolute w-6 h-6 rounded-full border border-sky-500/40" />

        {/* Radar scanning sweep for analyze mode */}
        <div
          ref={radarSweepRef}
          className="absolute w-10 h-10 rounded-full border border-sky-400/50 opacity-0 transition-opacity duration-200 pointer-events-none"
          style={{
            background: 'conic-gradient(from 0deg, rgba(2,132,199,0.3) 0deg, transparent 90deg, transparent 360deg)',
          }}
        />

        {/* Context badge label */}
        <div
          ref={badgeRef}
          className="absolute top-4 left-4 bg-slate-950/90 text-white border border-slate-700 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded shadow-lg whitespace-nowrap opacity-0 transition-all duration-200 tracking-wider pointer-events-none"
        />
      </div>

      {/* Trailing Satellite Miniature (follows with smooth 180ms easing) */}
      <div
        ref={satelliteRef}
        className="absolute top-0 left-0 pointer-events-none will-change-transform flex items-center justify-center"
      >
        {/* SVG Aerospace Satellite Silhouette */}
        <svg
          width="32"
          height="28"
          viewBox="0 0 32 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_2px_4px_rgba(15,23,42,0.3)]"
        >
          {/* Left Solar Panel Array with solar cell grid */}
          <rect x="1" y="9" width="10" height="10" rx="1" fill="#0284c7" stroke="#38bdf8" strokeWidth="0.75" />
          <line x1="1" y1="14" x2="11" y2="14" stroke="#bae6fd" strokeWidth="0.5" />
          <line x1="6" y1="9" x2="6" y2="19" stroke="#bae6fd" strokeWidth="0.5" />
          {/* Solar Panel Boom Left */}
          <line x1="11" y1="14" x2="13" y2="14" stroke="#94a3b8" strokeWidth="1" />

          {/* Right Solar Panel Array with solar cell grid */}
          <rect x="21" y="9" width="10" height="10" rx="1" fill="#0284c7" stroke="#38bdf8" strokeWidth="0.75" />
          <line x1="21" y1="14" x2="31" y2="14" stroke="#bae6fd" strokeWidth="0.5" />
          <line x1="26" y1="9" x2="26" y2="19" stroke="#bae6fd" strokeWidth="0.5" />
          {/* Solar Panel Boom Right */}
          <line x1="19" y1="14" x2="21" y2="14" stroke="#94a3b8" strokeWidth="1" />

          {/* Central Satellite Main Bus */}
          <rect x="13" y="8" width="6" height="12" rx="1" fill="#0f172a" stroke="#cbd5e1" strokeWidth="0.75" />
          {/* Gold Thermal Multi-Layer Insulation Accent */}
          <rect x="14" y="10" width="4" height="4" fill="#f59e0b" />
          {/* Optical Sensor Aperture */}
          <circle cx="16" cy="17" r="1.2" fill="#38bdf8" />

          {/* High-Gain Telemetry Antenna Boom */}
          <line x1="16" y1="8" x2="16" y2="3" stroke="#cbd5e1" strokeWidth="0.8" />
          {/* Parabolic Antenna Dish / Horn */}
          <path d="M13.5 3C14.5 4.5 17.5 4.5 18.5 3" stroke="#e2e8f0" strokeWidth="1" strokeLinecap="round" />
          {/* Telemetry Pulse Dot */}
          <circle cx="16" cy="2" r="0.8" fill="#10b981" />
        </svg>

        {/* Subtle orbital link tether line */}
        <div className="absolute top-1/2 left-1/2 w-4 h-[1px] bg-sky-400/30 origin-left rotate-45 pointer-events-none" />
      </div>
    </div>
  );
};
