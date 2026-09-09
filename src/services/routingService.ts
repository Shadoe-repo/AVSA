import { Coordinates } from '../types';

export function calculateDistanceKm(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371; // Earth's radius in km
  const dLat = (coord2.latitude - coord1.latitude) * Math.PI / 180;
  const dLon = (coord2.longitude - coord1.longitude) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(coord1.latitude * Math.PI / 180) * Math.cos(coord2.latitude * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

export function estimateEtaMinutes(distanceKm: number, trafficLevel: 'LIGHT' | 'MODERATE' | 'HEAVY' = 'MODERATE'): number {
  let avgSpeedKmh = 40;
  if (trafficLevel === 'LIGHT') avgSpeedKmh = 50;
  if (trafficLevel === 'HEAVY') avgSpeedKmh = 25;
  const hours = distanceKm / avgSpeedKmh;
  return Math.max(1, Math.round(hours * 60));
}

// Generate realistic polyline points between start and destination for smooth vehicle movement
export function generateRoutePoints(start: Coordinates, dest: Coordinates, numPoints = 25): Coordinates[] {
  const points: Coordinates[] = [];
  
  // Add intermediate realistic waypoints that simulate real Kolkata street turns (e.g. EM Bypass or AJC Bose Road)
  const midLat = (start.latitude + dest.latitude) / 2;
  const midLon = (start.longitude + dest.longitude) / 2;
  const jitterLat = (dest.longitude - start.longitude) * 0.15;
  const jitterLon = -(dest.latitude - start.latitude) * 0.15;

  const waypoints = [
    start,
    { latitude: start.latitude * 0.7 + midLat * 0.3 + jitterLat * 0.5, longitude: start.longitude * 0.7 + midLon * 0.3 + jitterLon * 0.5 },
    { latitude: midLat + jitterLat, longitude: midLon + jitterLon },
    { latitude: dest.latitude * 0.6 + midLat * 0.4 + jitterLat * 0.3, longitude: dest.longitude * 0.6 + midLon * 0.4 + jitterLon * 0.3 },
    dest
  ];

  // Interpolate along waypoints
  for (let i = 0; i < waypoints.length - 1; i++) {
    const p1 = waypoints[i];
    const p2 = waypoints[i + 1];
    const segmentSteps = Math.floor(numPoints / (waypoints.length - 1));
    for (let step = 0; step < segmentSteps; step++) {
      const t = step / segmentSteps;
      points.push({
        latitude: p1.latitude + (p2.latitude - p1.latitude) * t,
        longitude: p1.longitude + (p2.longitude - p1.longitude) * t,
      });
    }
  }
  points.push(dest);
  return points;
}

export async function fetchRoutePoints(start: Coordinates, dest: Coordinates): Promise<Coordinates[]> {
  const startPoint = `${start.longitude},${start.latitude}`;
  const destinationPoint = `${dest.longitude},${dest.latitude}`;
  const url = `https://router.project-osrm.org/route/v1/driving/${startPoint};${destinationPoint}?overview=full&geometries=geojson`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Routing request failed: ${response.status}`);

    const data: {
      routes?: Array<{ geometry?: { coordinates?: Array<[number, number]> } }>;
    } = await response.json();
    const coordinates = data.routes?.[0]?.geometry?.coordinates;

    if (!coordinates || coordinates.length < 2) {
      throw new Error('Routing response did not include a usable geometry');
    }

    return coordinates.map(([longitude, latitude]) => ({ latitude, longitude }));
  } catch {
    return generateRoutePoints(start, dest, 30);
  }
}

export function checkHospitalGeofence(currentCoord: Coordinates, hospitalCoord: Coordinates): 'ARRIVED' | 'APPROACHING' | 'EN_ROUTE' {
  const distKm = calculateDistanceKm(currentCoord, hospitalCoord);
  if (distKm <= 0.25) {
    return 'ARRIVED';
  } else if (distKm <= 1.5) {
    return 'APPROACHING';
  }
  return 'EN_ROUTE';
}
