import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useEmergency } from '../../context/EmergencyContext';
import { Hospital, EmergencyCase } from '../../types';

interface LiveOperationsMapProps {
  interactive?: boolean;
  onSelectCase?: (emergencyId: string) => void;
  className?: string;
  focusAmbulanceId?: string;
}

export const LiveOperationsMap: React.FC<LiveOperationsMapProps> = ({
  onSelectCase,
  className = 'h-full w-full',
  focusAmbulanceId
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const polylineRef = useRef<L.Polyline | null>(null);
  const geofenceCircleRef = useRef<L.Circle | null>(null);

  const {
    hospitals,
    activeEmergency,
    hospitalEmergencies,
    allActiveEmergencies,
    selectedHospital,
    routeCoordinates
  } = useEmergency();

  // Initialize Leaflet Map once
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Dark styled map tiles (CartoDB Dark Matter)
    const map = L.map(mapContainerRef.current, {
      center: [22.5650, 88.3800],
      zoom: 13,
      zoomControl: true,
      attributionControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
      subdomains: 'abc'
    }).addTo(map);

    mapInstanceRef.current = map;

    // Invalidate size once container mounts and on window resize
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    const handleResize = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Hospital Markers & Geofences
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    hospitals.forEach((hospital: Hospital) => {
      const key = `hosp_${hospital.hospitalId}`;
      const isSelected = selectedHospital?.hospitalId === hospital.hospitalId;

      const hospitalIconHtml = `
        <div class="relative flex items-center justify-center">
          <div class="w-10 h-10 rounded-2xl flex items-center justify-center border ${
            isSelected 
              ? 'bg-blue-600/90 border-blue-400 shadow-lg shadow-blue-500/50' 
              : 'bg-[#0f2233]/90 border-white/20'
          } backdrop-blur-md transition-transform duration-200 hover:scale-110">
            <span class="text-white text-base font-bold">H</span>
          </div>
          <div class="absolute -bottom-5 px-2 py-0.5 rounded-full bg-slate-900/90 border border-white/20 text-[10px] text-slate-200 font-medium whitespace-nowrap shadow-md">
            ${hospital.availableBeds} beds
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: hospitalIconHtml,
        className: 'custom-hosp-marker',
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      if (!markersRef.current[key]) {
        const marker = L.marker([hospital.coordinates.latitude, hospital.coordinates.longitude], { icon: customIcon })
          .addTo(map)
          .bindPopup(`
            <div style="background:#0b1723; color:#F7FAFC; padding:8px; border-radius:12px; border:1px solid rgba(255,255,255,0.2);">
              <b style="font-size:14px; display:block; margin-bottom:4px;">${hospital.name}</b>
              <div style="color:#AAB6C4; font-size:12px; margin-bottom:4px;">Available ER Beds: <span style="color:#30D158; font-weight:bold;">${hospital.availableBeds}</span> (ICU: ${hospital.icuBeds})</div>
              <div style="color:#718092; font-size:11px;">Status: ${hospital.emergencyStatus}</div>
            </div>
          `);
        markersRef.current[key] = marker;
      } else {
        markersRef.current[key].setIcon(customIcon);
      }
    });

    // Draw geofence circle around selected hospital (250m & 1.5km)
    if (selectedHospital) {
      if (geofenceCircleRef.current) {
        geofenceCircleRef.current.remove();
      }
      geofenceCircleRef.current = L.circle(
        [selectedHospital.coordinates.latitude, selectedHospital.coordinates.longitude],
        {
          radius: 1500,
          color: '#0A84FF',
          fillColor: '#0A84FF',
          fillOpacity: 0.05,
          weight: 1,
          dashArray: '4, 8'
        }
      ).addTo(map);
    }
  }, [hospitals, selectedHospital?.hospitalId]);

  // Update Ambulance Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Combine active emergency + hospital emergencies + citywide dispatches
    const allRelevantEmergencies: EmergencyCase[] = [];
    if (activeEmergency) allRelevantEmergencies.push(activeEmergency);
    hospitalEmergencies.forEach(e => {
      if (!allRelevantEmergencies.some(x => x.emergencyId === e.emergencyId)) {
        allRelevantEmergencies.push(e);
      }
    });
    allActiveEmergencies.forEach(e => {
      if (!allRelevantEmergencies.some(x => x.emergencyId === e.emergencyId)) {
        allRelevantEmergencies.push(e);
      }
    });

    // Prune stale / completed markers from map
    const activeKeys = new Set(allRelevantEmergencies.map(e => `amb_${e.emergencyId}`));
    Object.keys(markersRef.current).forEach(k => {
      if (k.startsWith('amb_') && !activeKeys.has(k)) {
        markersRef.current[k].remove();
        delete markersRef.current[k];
      }
    });

    allRelevantEmergencies.forEach(emg => {
      const key = `amb_${emg.emergencyId}`;
      const isCritical = emg.severity === 'CRITICAL';
      const isFocused = emg.ambulanceId === focusAmbulanceId || emg.emergencyId === activeEmergency?.emergencyId;
      const etaMin = Math.ceil(emg.etaSeconds / 60);

      const markerColor = isCritical ? '#FF453A' : emg.severity === 'HIGH' ? '#FF9F0A' : '#0A84FF';

      const ambulanceIconHtml = `
        <div class="relative flex flex-col items-center justify-center cursor-pointer group">
          ${isCritical ? '<div class="absolute w-12 h-12 rounded-full animate-ping opacity-50" style="background-color:' + markerColor + '"></div>' : ''}
          <div class="w-10 h-10 rounded-full flex items-center justify-center border-2 ${
            isFocused ? 'scale-110 ring-4 ring-blue-400/40' : ''
          } shadow-xl backdrop-blur-md transition-all duration-300"
            style="background-color: #071018; border-color: ${markerColor}">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${markerColor}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
              <path d="M15 18H9"/>
              <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
              <circle cx="17" cy="18" r="2"/>
              <circle cx="7" cy="18" r="2"/>
            </svg>
          </div>
          <div class="mt-1 px-2 py-0.5 rounded-full bg-slate-900/90 border border-white/20 text-[10px] text-white font-bold whitespace-nowrap shadow-md">
            ${emg.ambulanceId} • ${etaMin}m
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: ambulanceIconHtml,
        className: 'custom-amb-marker',
        iconSize: [44, 52],
        iconAnchor: [22, 26]
      });

      if (!markersRef.current[key]) {
        const marker = L.marker([emg.currentLocation.latitude, emg.currentLocation.longitude], { icon: customIcon })
          .addTo(map)
          .bindPopup(`
            <div style="background:#0b1723; color:#F7FAFC; padding:8px; border-radius:12px; border:1px solid rgba(255,255,255,0.2);">
              <b style="font-size:13px; display:block; margin-bottom:2px;">${emg.ambulanceId} (${emg.emergencyId})</b>
              <div style="color:#AAB6C4; font-size:11px;">Severity: <strong style="color:${markerColor};">${emg.severity}</strong></div>
              <div style="color:#718092; font-size:11px;">Status: ${emg.status.replace(/_/g, ' ')} • ETA ~${etaMin}m</div>
            </div>
          `)
          .on('click', () => {
            if (onSelectCase) onSelectCase(emg.emergencyId);
          });
        markersRef.current[key] = marker;
      } else {
        // Smoothly update position
        markersRef.current[key].setLatLng([emg.currentLocation.latitude, emg.currentLocation.longitude]);
        markersRef.current[key].setIcon(customIcon);
      }
    });
  }, [activeEmergency?.currentLocation, activeEmergency?.etaSeconds, hospitalEmergencies, allActiveEmergencies, focusAmbulanceId]);

  // Auto fit bounds ONLY when active hospital route is established (not on every GPS tick!)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (activeEmergency && activeEmergency.destinationHospital && routeCoordinates.length > 0) {
      const bounds = L.latLngBounds([
        [activeEmergency.currentLocation.latitude, activeEmergency.currentLocation.longitude],
        [activeEmergency.destinationHospital.coordinates.latitude, activeEmergency.destinationHospital.coordinates.longitude]
      ]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [activeEmergency?.emergencyId, activeEmergency?.hospitalId]);

  // Update Route Polyline
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (routeCoordinates.length > 0) {
      const latLngs = routeCoordinates.map(c => [c.latitude, c.longitude] as [number, number]);

      if (!polylineRef.current) {
        polylineRef.current = L.polyline(latLngs, {
          color: '#0A84FF',
          weight: 5,
          opacity: 0.85,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(map);
      } else {
        polylineRef.current.setLatLngs(latLngs);
      }
    } else if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }
  }, [routeCoordinates]);

  return (
    <div className={`relative ${className} overflow-hidden rounded-card border border-white/10`}>
      <div ref={mapContainerRef} className="h-full w-full z-0" />
      
      {/* Map status overlay badge */}
      <div className="absolute top-3 left-3 z-[1000] flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/15 text-xs text-slate-300 font-medium">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>Live Emergency GPS Grid</span>
      </div>
    </div>
  );
};
