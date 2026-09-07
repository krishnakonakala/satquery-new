/**
 * SATQUERY AI — 3D Earth Globe Visualization
 * Three.js High-Precision Earth with Atmosphere, Polar Sun-Synchronous Orbits,
 * Interactive State Pins, Smooth Rotation Focus, and Mouse Drag/Zoom.
 * Smart India Hackathon 2026 — PS 26167
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EarthEvent, SatelliteMission } from '../types';
import { INDIAN_STATES_DATA } from './EarthMap';

interface ThreeEarthProps {
  events: EarthEvent[];
  satellites?: SatelliteMission[];
  selectedStateId?: string;
  onSelectState?: (stateId: string) => void;
  selectedCoordinates?: { lat: number; lng: number } | null;
}

export const ThreeEarth: React.FC<ThreeEarthProps> = ({
  events,
  satellites = [],
  selectedStateId = 'assam',
  onSelectState,
  selectedCoordinates,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const targetRotationRef = useRef<{ x: number; y: number }>({ x: 0.31, y: -0.2 });

  // Function to focus on specific lat/lng
  const focusOnCoordinates = (lat: number, lng: number) => {
    // Target rotation X (tilt) & Y (spin)
    const targetY = -((lng - 90) * Math.PI) / 180;
    const targetX = (lat * Math.PI) / 180;
    targetRotationRef.current = {
      x: Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, targetX)),
      y: targetY,
    };
  };

  // When selectedStateId or selectedCoordinates changes, trigger focus
  useEffect(() => {
    if (selectedCoordinates) {
      focusOnCoordinates(selectedCoordinates.lat, selectedCoordinates.lng);
      return;
    }
    const state = INDIAN_STATES_DATA.find((s) => s.id === selectedStateId);
    if (state) {
      focusOnCoordinates(state.center[0], state.center[1]);
    }
  }, [selectedStateId, selectedCoordinates]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.set(0, 0, 2.85);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Earth Geometry & Procedural High-Contrast Scientific Canvas Texture
    const earthGeometry = new THREE.SphereGeometry(1, 64, 64);
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Light Ocean (Pale scientific ocean blue)
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(0, 0, 2048, 1024);

      // Continents (Clean off-white / silver landmass)
      ctx.fillStyle = '#ffffff';

      // Eurasia continent mass
      ctx.fillRect(1050, 180, 850, 280);
      // Africa
      ctx.fillRect(920, 360, 380, 380);
      // Americas
      ctx.fillRect(180, 220, 480, 520);
      // Australia
      ctx.fillRect(1620, 580, 260, 220);

      // India Subcontinent Peninsula
      ctx.fillStyle = '#f0f9ff';
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(1415, 307); // Kashmir
      ctx.lineTo(1470, 340); // Delhi area
      ctx.lineTo(1570, 360); // Assam / Northeast
      ctx.lineTo(1520, 430); // Odisha
      ctx.lineTo(1468, 510); // Kanyakumari
      ctx.lineTo(1420, 450); // Mumbai
      ctx.lineTo(1395, 370); // Gujarat
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Precision Lat/Long Graticule lines
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.45;
      for (let x = 0; x < 2048; x += 128) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 1024);
        ctx.stroke();
      }
      for (let y = 0; y < 1024; y += 128) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(2048, y);
        ctx.stroke();
      }
    }

    const earthTexture = new THREE.CanvasTexture(canvas);
    const earthMaterial = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.65,
      metalness: 0.1,
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    earth.rotation.y = targetRotationRef.current.y;
    earth.rotation.x = targetRotationRef.current.x;
    scene.add(earth);

    // 3. Subtle Atmospheric Shell (Soft cyan aerospace glow)
    const atmosphereGeometry = new THREE.SphereGeometry(1.025, 48, 48);
    const atmosphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.14,
      side: THREE.BackSide,
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphere);

    // 4. Polar Sun-Synchronous Satellite Orbit Rings
    const orbitGroup = new THREE.Group();
    const orbitGeometry = new THREE.RingGeometry(1.22, 1.225, 96);
    const orbitMaterial = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
    });

    // Orbit 1: EOS-04 RISAT-1A (SSO Dawn-Dusk)
    const orbit1 = new THREE.Mesh(orbitGeometry, orbitMaterial);
    orbit1.rotation.x = Math.PI / 2 + (97.5 * Math.PI) / 180;
    orbit1.rotation.y = 0.3;
    orbitGroup.add(orbit1);

    // Orbit 2: Cartosat-3 SSO
    const orbit2Material = orbitMaterial.clone();
    orbit2Material.color.setHex(0x059669);
    const orbit2 = new THREE.Mesh(new THREE.RingGeometry(1.26, 1.265, 96), orbit2Material);
    orbit2.rotation.x = Math.PI / 2 + (97.5 * Math.PI) / 180;
    orbit2.rotation.y = 1.1;
    orbitGroup.add(orbit2);

    scene.add(orbitGroup);

    // 5. Interactive State Pins on 3D Globe Surface
    const pinsGroup = new THREE.Group();
    INDIAN_STATES_DATA.forEach((st) => {
      const lat = st.center[0];
      const lng = st.center[1];

      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180) * (Math.PI / 180);

      const x = -(1.02 * Math.sin(phi) * Math.cos(theta));
      const z = 1.02 * Math.sin(phi) * Math.sin(theta);
      const y = 1.02 * Math.cos(phi);

      const isAlert = st.status === 'FLOOD' || st.status === 'CYCLONE';
      const pinColor = isAlert ? 0xdc2626 : 0x0284c7;

      const pinGeom = new THREE.SphereGeometry(0.022, 16, 16);
      const pinMat = new THREE.MeshBasicMaterial({ color: pinColor });
      const pinMesh = new THREE.Mesh(pinGeom, pinMat);
      pinMesh.position.set(x, y, z);
      pinMesh.userData = { stateId: st.id };
      pinsGroup.add(pinMesh);

      // Halo ring
      const haloGeom = new THREE.RingGeometry(0.028, 0.04, 24);
      const haloMat = new THREE.MeshBasicMaterial({
        color: pinColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7,
      });
      const halo = new THREE.Mesh(haloGeom, haloMat);
      halo.position.set(x * 1.002, y * 1.002, z * 1.002);
      halo.lookAt(0, 0, 0);
      pinsGroup.add(halo);
    });
    earth.add(pinsGroup);

    // 6. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.25);
    sunLight.position.set(5, 4, 3);
    scene.add(sunLight);

    // 7. Interactive Mouse Drag & Zoom Controls
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMousePos.x;
      const deltaY = e.clientY - prevMousePos.y;

      targetRotationRef.current.y += deltaX * 0.005;
      targetRotationRef.current.x += deltaY * 0.005;
      targetRotationRef.current.x = Math.max(
        -Math.PI / 2.5,
        Math.min(Math.PI / 2.5, targetRotationRef.current.x)
      );

      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z += e.deltaY * 0.0015;
      camera.position.z = Math.max(1.7, Math.min(4.5, camera.position.z));
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domElement.addEventListener('wheel', onWheel, { passive: false });

    // 8. Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Smooth damped rotation toward target
      earth.rotation.y += (targetRotationRef.current.y - earth.rotation.y) * 0.08;
      earth.rotation.x += (targetRotationRef.current.x - earth.rotation.x) * 0.08;

      // Orbit Precession
      orbitGroup.rotation.y += 0.0006;

      renderer.render(scene, camera);
    };
    animate();

    // 9. Resize handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domElement.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', handleResize);
      if (container.contains(domElement)) {
        container.removeChild(domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-[500px] bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center overflow-hidden rounded-lg border border-slate-200 shadow-inner">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Floating State Focus Pills */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-auto">
        <div className="bg-white/90 backdrop-blur-md border border-slate-200 rounded-lg p-3 shadow-md space-y-2 max-w-sm text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 flex items-center gap-1.5 uppercase font-mono text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>3D ORBITAL FOCUS</span>
            </span>
            <button
              onClick={() => focusOnCoordinates(22.5, 79.5)}
              className="text-[10px] font-mono text-sky-700 hover:underline font-bold cursor-pointer"
            >
              Reset India
            </button>
          </div>

          <p className="text-[11px] text-slate-600">
            Select a region to smoothly rotate and focus the 3D globe onto real disaster telemetry:
          </p>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {INDIAN_STATES_DATA.slice(0, 6).map((st) => (
              <button
                key={st.id}
                onClick={() => {
                  onSelectState?.(st.id);
                  focusOnCoordinates(st.center[0], st.center[1]);
                }}
                className={`px-2 py-1 rounded text-xs font-bold transition cursor-pointer ${
                  st.id === selectedStateId
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
                }`}
              >
                {st?.name || st?.id || 'State'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-3 right-4 pointer-events-none text-[10px] font-mono text-slate-500 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded border border-slate-200 shadow-xs">
        DRAG MOUSE TO ROTATE GLOBE • SCROLL WHEEL TO ZOOM
      </div>
    </div>
  );
};
