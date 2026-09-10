import React, { useCallback, useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useEmergency } from '../../context/EmergencyContext';
import { Hospital, EmergencyCase } from '../../types';
import { findNearbyHospitals } from '../../services/nearbyHospitalService';

interface LiveOperationsMapProps {
  interactive?: boolean;
  onSelectCase?: (emergencyId: string) => void;
  className?: string;
  focusAmbulanceId?: string;
}

type DeviceLocationStatus = 'idle' | 'locating' | 'ready' | 'denied' | 'unavailable';
type NearbyHospitalStatus = 'idle' | 'loading' | 'ready' | 'unavailable';

const escapePopupText = (value: string) => {
  const entities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  };

  return value.replace(/[&<>'"]/g, (character) => entities[character] || character);
};

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
  const routeStartMarkerRef = useRef<L.Marker | null>(null);
  const routeEndMarkerRef = useRef<L.Marker | null>(null);
  const deviceLocationMarkerRef = useRef<L.Marker | null>(null);
  const nearbyHospitalLayerRef = useRef<L.LayerGroup | null>(null);
  const [deviceLocation, setDeviceLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [deviceLocationStatus, setDeviceLocationStatus] = useState<DeviceLocationStatus>('idle');
  const [nearbyHospitalStatus, setNearbyHospitalStatus] = useState<NearbyHospitalStatus>('idle');
  const [nearbyHospitalCount, setNearbyHospitalCount] = useState(0);

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

  const requestDeviceLocation = useCallback(() => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      setDeviceLocationStatus('unavailable');
      return;
    }

    setDeviceLocationStatus('locating');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const currentLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };

        setDeviceLocation(currentLocation);
        setDeviceLocationStatus('ready');
        mapInstanceRef.current?.flyTo(
          [currentLocation.latitude, currentLocation.longitude],
          13,
          { animate: true, duration: 0.8 }
        );
      },
      (error) => {
        setDeviceLocationStatus(
          error.code === error.PERMISSION_DENIED ? 'denied' : 'unavailable'
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  }, []);

  // Do not trigger a permission prompt during a demo. If location access was
  // approved earlier, refresh the marker and nearby hospitals automatically.
  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation || !navigator.permissions) {
      return;
    }

    let isCurrent = true;
    navigator.permissions.query({ name: 'geolocation' })
      .then((permission) => {
        if (isCurrent && permission.state === 'granted') {
          requestDeviceLocation();
        }
      })
      .catch(() => {
        // The explicit map control remains available when Permissions API is unsupported.
      });

    return () => {
      isCurrent = false;
    };
  }, [requestDeviceLocation]);

  // Render the browser-provided location separately from the simulated
  // ambulance stream so operators can distinguish the two positions.
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !deviceLocation) return;

    const icon = L.divIcon({
      html: '<div class="map-device-location-marker"></div>',
      className: 'map-device-location-wrapper',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    const coordinates: [number, number] = [deviceLocation.latitude, deviceLocation.longitude];
    if (!deviceLocationMarkerRef.current) {
      deviceLocationMarkerRef.current = L.marker(coordinates, { icon, zIndexOffset: 1100 })
        .addTo(map)
        .bindPopup('<div style="font-weight:700; color:var(--map-popup-text);">Current device location</div>');
    } else {
      deviceLocationMarkerRef.current.setLatLng(coordinates).setIcon(icon);
    }
  }, [deviceLocation]);

  // This lookup runs only after the operator has shared a location. It keeps
  // the static demo hospital network separate from locally mapped hospitals.
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !deviceLocation) return;

    const layer = nearbyHospitalLayerRef.current || L.layerGroup().addTo(map);
    nearbyHospitalLayerRef.current = layer;
    const controller = new AbortController();
    setNearbyHospitalStatus('loading');

    findNearbyHospitals(deviceLocation, controller.signal)
      .then((nearbyHospitals) => {
        if (controller.signal.aborted) return;

        layer.clearLayers();
        nearbyHospitals.forEach((hospital) => {
          const markerColor = hospital.hasEmergencyService ? '#30D158' : '#0A84FF';
          L.circleMarker(
            [hospital.coordinates.latitude, hospital.coordinates.longitude],
            {
              radius: 7,
              color: '#ffffff',
              weight: 2,
              fillColor: markerColor,
              fillOpacity: 1
            }
          )
            .addTo(layer)
            .bindPopup(`
              <div style="background:var(--map-popup-bg); color:var(--map-popup-text); padding:8px; border-radius:12px; border:1px solid var(--border);">
                <b style="font-size:13px; display:block; margin-bottom:3px;">${escapePopupText(hospital.name)}</b>
                <div style="color:var(--map-popup-secondary); font-size:11px;">${hospital.distanceKm} km from current location</div>
                <div style="color:${markerColor}; font-size:10px; font-weight:700; margin-top:3px;">${hospital.hasEmergencyService ? 'EMERGENCY SERVICE MAPPED' : 'HOSPITAL MAPPED'}</div>
              </div>
            `);
        });

        setNearbyHospitalCount(nearbyHospitals.length);
        setNearbyHospitalStatus('ready');
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setNearbyHospitalCount(0);
          setNearbyHospitalStatus('unavailable');
        }
      });

    return () => controller.abort();
  }, [deviceLocation]);

  // Update Hospital Markers & Geofences
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const routeOnly = Boolean(focusAmbulanceId && activeEmergency?.hospitalId);
    const visibleHospitals = routeOnly
      ? hospitals.filter(hospital => hospital.hospitalId === activeEmergency?.hospitalId)
      : hospitals;

    visibleHospitals.forEach((hospital: Hospital) => {
      const key = `hosp_${hospital.hospitalId}`;
      const isSelected = selectedHospital?.hospitalId === hospital.hospitalId;

      const hospitalIconHtml = `
        <div class="relative flex items-center justify-center">
          <div class="map-hospital-marker w-10 h-10 rounded-2xl flex items-center justify-center border ${
            isSelected 
              ? 'bg-blue-600/90 border-blue-400 shadow-lg shadow-blue-500/50' 
              : 'bg-[#0f2233]/90 border-white/20'
          } backdrop-blur-md transition-transform duration-200 hover:scale-110">
            <span class="text-white text-base font-bold">H</span>
          </div>
          <div class="map-marker-label absolute -bottom-5 px-2 py-0.5 rounded-full bg-slate-900/90 border border-white/20 text-[10px] text-slate-200 font-medium whitespace-nowrap shadow-md">
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
            <div style="background:var(--map-popup-bg); color:var(--map-popup-text); padding:8px; border-radius:12px; border:1px solid var(--border);">
              <b style="font-size:14px; display:block; margin-bottom:4px;">${hospital.name}</b>
              <div style="color:var(--map-popup-secondary); font-size:12px; margin-bottom:4px;">Available ER Beds: <span style="color:#30D158; font-weight:bold;">${hospital.availableBeds}</span> (ICU: ${hospital.icuBeds})</div>
              <div style="color:var(--text-muted); font-size:11px;">Status: ${hospital.emergencyStatus}</div>
            </div>
          `);
        markersRef.current[key] = marker;
      } else {
        markersRef.current[key].setIcon(customIcon);
      }
    });

    // Draw geofence circle around selected hospital (250m & 1.5km)
    const geofenceHospital = routeOnly
      ? visibleHospitals[0]
      : selectedHospital;

    const visibleHospitalKeys = new Set(visibleHospitals.map(hospital => `hosp_${hospital.hospitalId}`));
    Object.keys(markersRef.current).forEach(key => {
      if (key.startsWith('hosp_') && !visibleHospitalKeys.has(key)) {
        markersRef.current[key].remove();
        delete markersRef.current[key];
      }
    });

    if (geofenceHospital) {
      if (geofenceCircleRef.current) {
        geofenceCircleRef.current.remove();
      }
      geofenceCircleRef.current = L.circle(
        [geofenceHospital.coordinates.latitude, geofenceHospital.coordinates.longitude],
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
  }, [hospitals, selectedHospital?.hospitalId, activeEmergency?.hospitalId, focusAmbulanceId]);

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

    const visibleEmergencies = focusAmbulanceId && activeEmergency?.hospitalId
      ? allRelevantEmergencies.filter(e => e.emergencyId === activeEmergency.emergencyId)
      : allRelevantEmergencies;

    // Prune stale / completed markers from map
    const activeKeys = new Set(visibleEmergencies.map(e => `amb_${e.emergencyId}`));
    Object.keys(markersRef.current).forEach(k => {
      if (k.startsWith('amb_') && !activeKeys.has(k)) {
        markersRef.current[k].remove();
        delete markersRef.current[k];
      }
    });

    visibleEmergencies.forEach(emg => {
      const key = `amb_${emg.emergencyId}`;
      const isCritical = emg.severity === 'CRITICAL';
      const isFocused = emg.ambulanceId === focusAmbulanceId || emg.emergencyId === activeEmergency?.emergencyId;
      const etaMin = Math.ceil(emg.etaSeconds / 60);

      const markerColor = isCritical ? '#FF453A' : emg.severity === 'HIGH' ? '#FF9F0A' : '#0A84FF';

      const ambulanceIconHtml = `
        <div class="relative flex flex-col items-center justify-center cursor-pointer group">
          ${isCritical ? '<div class="absolute w-12 h-12 rounded-full animate-ping opacity-50" style="background-color:' + markerColor + '"></div>' : ''}
          <div class="map-ambulance-marker w-10 h-10 rounded-full flex items-center justify-center border-2 ${
            isFocused ? 'scale-110 ring-4 ring-blue-400/40' : ''
          } shadow-xl backdrop-blur-md transition-all duration-300"
            style="background-color: var(--map-marker-bg); border-color: ${markerColor}">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${markerColor}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
              <path d="M15 18H9"/>
              <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
              <circle cx="17" cy="18" r="2"/>
              <circle cx="7" cy="18" r="2"/>
            </svg>
          </div>
          <div class="map-marker-label mt-1 px-2 py-0.5 rounded-full bg-slate-900/90 border border-white/20 text-[10px] text-white font-bold whitespace-nowrap shadow-md">
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
            <div style="background:var(--map-popup-bg); color:var(--map-popup-text); padding:8px; border-radius:12px; border:1px solid var(--border);">
              <b style="font-size:13px; display:block; margin-bottom:2px;">${emg.ambulanceId} (${emg.emergencyId})</b>
              <div style="color:var(--map-popup-secondary); font-size:11px;">Severity: <strong style="color:${markerColor};">${emg.severity}</strong></div>
              <div style="color:var(--text-muted); font-size:11px;">Status: ${emg.status.replace(/_/g, ' ')} • ETA ~${etaMin}m</div>
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
  }, [activeEmergency?.emergencyId, activeEmergency?.hospitalId, routeCoordinates.length]);

  // Update Route Polyline
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (routeCoordinates.length > 0) {
      const currentLocation = activeEmergency?.currentLocation;
      let visibleRoute = routeCoordinates;

      if (currentLocation) {
        let closestIndex = 0;
        let closestDistance = Number.POSITIVE_INFINITY;
        routeCoordinates.forEach((point, index) => {
          const distance = Math.hypot(
            point.latitude - currentLocation.latitude,
            point.longitude - currentLocation.longitude
          );
          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
          }
        });
        visibleRoute = [currentLocation, ...routeCoordinates.slice(closestIndex + 1)];
      }

      const latLngs = visibleRoute.map(c => [c.latitude, c.longitude] as [number, number]);

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
  }, [routeCoordinates, activeEmergency?.currentLocation]);

  // Keep labeled route endpoints tied to the live ambulance and destination.
  useEffect(() => {
    const map = mapInstanceRef.current;
    const targetHospital = activeEmergency?.destinationHospital ||
      hospitals.find(hospital => hospital.hospitalId === activeEmergency?.hospitalId);
    const currentLocation = activeEmergency?.currentLocation;

    if (!map || !currentLocation || !targetHospital || routeCoordinates.length === 0) {
      routeStartMarkerRef.current?.remove();
      routeEndMarkerRef.current?.remove();
      routeStartMarkerRef.current = null;
      routeEndMarkerRef.current = null;
      return;
    }

    const createEndpointIcon = (label: string, variant: 'start' | 'end') => L.divIcon({
      html: `<div class="route-endpoint route-endpoint-${variant}"><span class="route-endpoint-dot"></span><span>${label}</span></div>`,
      className: 'route-endpoint-wrapper',
      iconSize: [92, 28],
      iconAnchor: [12, 14]
    });

    const startLabel = `FROM ${activeEmergency.ambulanceId}`;
    const endLabel = `TO ${targetHospital.name}`;

    if (!routeStartMarkerRef.current) {
      routeStartMarkerRef.current = L.marker(
        [currentLocation.latitude, currentLocation.longitude],
        { icon: createEndpointIcon(startLabel, 'start'), zIndexOffset: 900 }
      ).addTo(map);
    } else {
      routeStartMarkerRef.current
        .setLatLng([currentLocation.latitude, currentLocation.longitude])
        .setIcon(createEndpointIcon(startLabel, 'start'));
    }

    if (!routeEndMarkerRef.current) {
      routeEndMarkerRef.current = L.marker(
        [targetHospital.coordinates.latitude, targetHospital.coordinates.longitude],
        { icon: createEndpointIcon(endLabel, 'end'), zIndexOffset: 900 }
      ).addTo(map);
    } else {
      routeEndMarkerRef.current
        .setLatLng([targetHospital.coordinates.latitude, targetHospital.coordinates.longitude])
        .setIcon(createEndpointIcon(endLabel, 'end'));
    }
  }, [activeEmergency?.ambulanceId, activeEmergency?.currentLocation, activeEmergency?.destinationHospital, activeEmergency?.hospitalId, hospitals, routeCoordinates.length]);

  const locationContext = deviceLocation
    ? 'Current device location'
    : focusAmbulanceId
      ? `Demo priority route: ${focusAmbulanceId}`
      : 'Kolkata demo network';
  const liveSummary = focusAmbulanceId
    ? 'Live ambulance tracking'
    : `${allActiveEmergencies.length} active emergency units`;
  const nearbySummary = nearbyHospitalStatus === 'loading'
    ? 'Finding nearby hospitals...'
    : nearbyHospitalStatus === 'ready'
      ? nearbyHospitalCount > 0
        ? `${nearbyHospitalCount} nearby hospitals mapped`
        : 'No mapped hospitals within 15 km'
      : nearbyHospitalStatus === 'unavailable'
        ? 'Nearby hospital lookup unavailable'
        : 'Share your location to map nearby hospitals';
  const locationAction = deviceLocationStatus === 'locating'
    ? 'Locating...'
    : deviceLocation
      ? 'Refresh location'
      : deviceLocationStatus === 'denied'
        ? 'Allow location access'
        : 'Use current location';

  return (
    <div className={`relative ${className} overflow-hidden rounded-card border border-white/10`}>
      <div ref={mapContainerRef} className="h-full w-full z-0" />
      
      {/* Map status overlay badge */}
      <div className="map-status-overlay absolute top-3 left-3 z-[1000] flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/15 text-xs text-slate-300 font-medium">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>{liveSummary}</span>
      </div>

      <div className="absolute top-3 right-3 z-[1000] w-52 rounded-2xl border border-[color:var(--border)] bg-[var(--panel-strong)] px-3 py-2 shadow-lg backdrop-blur-md">
        <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-500">Location intelligence</div>
        <div className="mt-0.5 text-xs font-semibold text-[var(--text-primary)]">{locationContext}</div>
        <div className="mt-1 text-[10px] leading-snug text-[var(--text-secondary)]">{nearbySummary}</div>
        <button
          type="button"
          onClick={requestDeviceLocation}
          disabled={deviceLocationStatus === 'locating'}
          className="mt-2 rounded-lg border border-emerald-500/35 bg-emerald-500/15 px-2 py-1 text-[10px] font-bold text-emerald-500 transition-colors hover:bg-emerald-500/25 disabled:cursor-wait disabled:opacity-60"
        >
          {locationAction}
        </button>
      </div>

      <div className="pointer-events-none absolute bottom-3 right-3 z-[1000] hidden items-center gap-3 rounded-full border border-[color:var(--border)] bg-[var(--panel-strong)] px-3 py-1.5 text-[10px] font-semibold text-[var(--text-secondary)] shadow-lg backdrop-blur-md sm:flex">
        <span className="flex items-center gap-1.5"><i className="h-1.5 w-4 rounded-full bg-blue-500" /> Live route</span>
        <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-red-500" /> Emergency unit</span>
        <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm border-2 border-blue-500" /> Destination</span>
        {deviceLocation && <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Nearby hospital</span>}
      </div>
    </div>
  );
};
