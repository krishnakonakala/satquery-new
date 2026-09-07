/**
 * SATQUERY AI — Earth Explorer (2D Leaflet GIS & 3D Globe)
 * Artistic Flair Theme (Deep Charcoal / Cyber Acid Lime #CBFB45 / Technical Monospace)
 * Smart India Hackathon 2026 — PS 26167
 */

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Globe,
  Map as MapIcon,
  Search,
  Crosshair,
  ArrowRight,
} from 'lucide-react';
import { EarthEvent, SatelliteMission } from '../types';
import { ThreeEarth } from './ThreeEarth';
import { geocodeLocation } from '../services/api';

interface EarthExplorerProps {
  events: EarthEvent[];
  satellites: SatelliteMission[];
  onSelectAOIForAnalysis: (aoi: {
    locationName: string;
    lat: number;
    lng: number;
    query: string;
    presetSample?: string;
  }) => void;
}

export const EarthExplorer: React.FC<EarthExplorerProps> = ({
  events,
  satellites,
  onSelectAOIForAnalysis,
}) => {
  const [viewMode, setViewMode] = useState<'2D' | '3D'>('2D');
  const [baseLayer, setBaseLayer] = useState<'dark' | 'satellite'>('dark');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedPin, setSelectedPin] = useState<{
    name: string;
    lat: number;
    lng: number;
    details?: string;
    presetSample?: string;
  } | null>({
    name: 'Assam Brahmaputra Flood Sector',
    lat: 26.2006,
    lng: 92.9376,
    details: 'EOS-04 C-band SAR and Resourcesat-2A AWiFS coverage available.',
    presetSample: 'flood',
  });

  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markerGroupRef = useRef<L.LayerGroup | null>(null);

  // Initialize Leaflet 2D Map
  useEffect(() => {
    if (viewMode !== '2D' || !mapContainerRef.current) return;

    if (!mapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [22.0, 79.5],
        zoom: 5,
        zoomControl: true,
      });

      // Dark Matter CartoDB tiles
      const tileUrl =
        baseLayer === 'satellite'
          ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
          : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

      const attribution =
        baseLayer === 'satellite'
          ? '&copy; Esri, Maxar, Earthstar Geographics'
          : '&copy; CartoDB &copy; OpenStreetMap contributors';

      L.tileLayer(tileUrl, { attribution, maxZoom: 18 }).addTo(map);

      const markerGroup = L.layerGroup().addTo(map);
      markerGroupRef.current = markerGroup;
      mapRef.current = map;

      // Handle map clicks to inspect location
      map.on('click', async (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        setSelectedPin({
          name: `Sector [${lat.toFixed(3)}, ${lng.toFixed(3)}]`,
          lat,
          lng,
          details: 'User inspected Area of Interest (AOI). Click below to dispatch to SatQuery AI.',
        });
      });
    } else {
      // Update tile layer if baseLayer toggled
      mapRef.current.eachLayer((layer) => {
        if (layer instanceof L.TileLayer) {
          mapRef.current?.removeLayer(layer);
        }
      });
      const tileUrl =
        baseLayer === 'satellite'
          ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
          : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

      L.tileLayer(tileUrl, { maxZoom: 18 }).addTo(mapRef.current);
    }

    // Populate markers for events & key sectors
    if (markerGroupRef.current && mapRef.current) {
      markerGroupRef.current.clearLayers();

      // Events markers styled with #CBFB45 or orange
      events.forEach((evt) => {
        const color = evt.eventType === 'WILDFIRE' ? '#ff5533' : '#CBFB45';
        const marker = L.circleMarker([evt.coordinates.lat, evt.coordinates.lng], {
          radius: 8,
          fillColor: color,
          color: '#080808',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9,
        });

        marker.bindPopup(`
          <div style="font-family: 'Space Grotesk', sans-serif; font-size: 11px; background: #080808; color: #fff; padding: 6px; border: 1px solid #333;">
            <strong style="color: #CBFB45; text-transform: uppercase;">${evt.title}</strong><br/>
            <span style="color: #888;">${evt.locationName}</span><br/>
            <span style="font-size: 10px; font-weight: bold; color: ${color};">${evt.eventType} • ${evt.severity}</span>
          </div>
        `);

        marker.on('click', () => {
          setSelectedPin({
            name: evt.title,
            lat: evt.coordinates.lat,
            lng: evt.coordinates.lng,
            details: evt.description,
            presetSample: evt.eventType === 'FLOOD' ? 'flood' : evt.eventType === 'URBAN_EXPANSION' ? 'urban' : undefined,
          });
        });

        markerGroupRef.current?.addLayer(marker);
      });

      // Sample satellite swaths in Electric Lime
      const assamBounds: L.LatLngBoundsExpression = [
        [25.8, 92.4],
        [26.6, 93.6],
      ];
      const swath = L.rectangle(assamBounds, {
        color: '#CBFB45',
        weight: 1.5,
        fillColor: '#CBFB45',
        fillOpacity: 0.15,
        dashArray: '3, 3',
      });
      swath.bindTooltip('EOS-04 Swath: Assam Riverine Basin', { sticky: true });
      markerGroupRef.current.addLayer(swath);
    }
  }, [viewMode, baseLayer, events]);

  // Handle Geocoding Search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    try {
      const res = await geocodeLocation(searchQuery);
      if (res.result) {
        const { lat, lng, placeName } = res.result;
        setSelectedPin({
          name: placeName,
          lat,
          lng,
          details: `Geocoded via ISRO Bhuvan SDI. Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}.`,
        });
        if (mapRef.current) {
          mapRef.current.flyTo([lat, lng], 9, { duration: 1.5 });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0c0c0c] border border-[#222] p-3">
        <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 max-w-md font-mono">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-[#555] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH_LOCATION (Brahmaputra, Hyderabad, Mumbai, Punjab)..."
              className="w-full bg-[#080808] border border-[#222] pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#555] focus:outline-none focus:border-[#CBFB45]"
            />
          </div>
          <button
            type="submit"
            disabled={searchLoading}
            className="px-3 py-1.5 bg-[#CBFB45] hover:bg-[#baf035] text-black font-black uppercase text-xs tracking-wider transition"
          >
            {searchLoading ? 'LOCATING...' : 'LOCATE'}
          </button>
        </form>

        <div className="flex items-center gap-2 font-mono text-xs">
          {/* Base Layer Switcher (2D) */}
          {viewMode === '2D' && (
            <div className="flex items-center bg-[#080808] p-1 border border-[#222]">
              <button
                onClick={() => setBaseLayer('dark')}
                className={`px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider transition ${
                  baseLayer === 'dark' ? 'bg-[#151515] text-[#CBFB45] border border-[#CBFB45]/40' : 'text-[#777]'
                }`}
              >
                Dark Matter
              </button>
              <button
                onClick={() => setBaseLayer('satellite')}
                className={`px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider transition ${
                  baseLayer === 'satellite' ? 'bg-[#151515] text-[#CBFB45] border border-[#CBFB45]/40' : 'text-[#777]'
                }`}
              >
                Satellite (Esri)
              </button>
            </div>
          )}

          {/* 2D vs 3D View Mode */}
          <div className="flex items-center bg-[#080808] p-1 border border-[#222]">
            <button
              onClick={() => setViewMode('2D')}
              className={`flex items-center gap-1 px-3 py-1 text-[10px] uppercase font-bold tracking-wider transition ${
                viewMode === '2D' ? 'bg-[#CBFB45] text-black' : 'text-[#777]'
              }`}
            >
              <MapIcon className="w-3 h-3" />
              <span>2D GIS</span>
            </button>
            <button
              onClick={() => setViewMode('3D')}
              className={`flex items-center gap-1 px-3 py-1 text-[10px] uppercase font-bold tracking-wider transition ${
                viewMode === '3D' ? 'bg-[#CBFB45] text-black' : 'text-[#777]'
              }`}
            >
              <Globe className="w-3 h-3" />
              <span>3D Globe</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Stage Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Map / Globe Viewport */}
        <div className="lg:col-span-3 h-[600px] border border-[#222] relative bg-[#050505]">
          {viewMode === '2D' ? (
            <div ref={mapContainerRef} className="w-full h-full" />
          ) : (
            <ThreeEarth
              events={events}
              onSelectEvent={(evt) => {
                setSelectedPin({
                  name: evt.title,
                  lat: evt.coordinates.lat,
                  lng: evt.coordinates.lng,
                  details: evt.description,
                  presetSample: evt.eventType === 'FLOOD' ? 'flood' : undefined,
                });
              }}
            />
          )}

          {/* Quick HUD indicator */}
          <div className="absolute top-3 right-3 z-[1000] pointer-events-none bg-[#080808]/90 px-3 py-1.5 border border-[#222] text-[10px] font-mono text-[#CBFB45]">
            CRS: EPSG:4326 // BHUVAN_SDI // ACTIVE
          </div>
        </div>

        {/* Right AOI Inspector Panel */}
        <div className="bg-[#0c0c0c] border border-[#222] p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-[#CBFB45] mb-4 font-black text-xs uppercase tracking-widest font-mono">
              <Crosshair className="w-4 h-4" />
              <span>INSPECTED_AOI_SECTOR</span>
            </div>

            {selectedPin ? (
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <h3 className="font-bold text-white text-sm tracking-tight">{selectedPin.name}</h3>
                  <div className="text-[#CBFB45] text-[10px] mt-0.5">
                    LAT: {selectedPin.lat.toFixed(4)}° | LNG: {selectedPin.lng.toFixed(4)}°
                  </div>
                </div>

                <p className="text-[#888] text-[11px] leading-relaxed bg-[#080808] p-3 border-l-2 border-[#CBFB45] border-t border-r border-b border-[#1c1c1c]">
                  {selectedPin.details || 'Geospatial sector selected. Ready for multimodal analysis.'}
                </p>

                <div className="space-y-1.5 pt-3 border-t border-[#1c1c1c] text-[10px] text-[#666]">
                  <div className="flex justify-between">
                    <span>CONSTELLATION:</span>
                    <span className="text-white">EOS-04, Resourcesat</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GSD_RESOLUTION:</span>
                    <span className="text-[#CBFB45]">10m - 56m</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GATEWAY:</span>
                    <span className="text-[#CBFB45]">BHOONIDHI_VERIFIED</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs font-mono text-[#555] italic">
                Click anywhere on the map or select an event marker to inspect remote sensing coverage.
              </p>
            )}
          </div>

          {selectedPin && (
            <div className="pt-4 border-t border-[#1c1c1c]">
              <button
                onClick={() =>
                  onSelectAOIForAnalysis({
                    locationName: selectedPin.name,
                    lat: selectedPin.lat,
                    lng: selectedPin.lng,
                    query: `Compare the pre and post satellite imagery over ${selectedPin.name} and quantify the environmental change.`,
                    presetSample: selectedPin.presetSample,
                  })
                }
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#CBFB45] hover:bg-[#baf035] text-black font-black uppercase text-xs tracking-[0.15em] transition shadow-[0_0_12px_rgba(203,251,69,0.25)] active:scale-95"
              >
                <span>Dispatch to Workspace</span>
                <ArrowRight className="w-3.5 h-3.5 fill-black" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
