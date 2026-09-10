import { Coordinates } from '../types';
import { calculateDistanceKm } from './routingService';

export interface NearbyHospital {
  id: string;
  name: string;
  coordinates: Coordinates;
  distanceKm: number;
  hasEmergencyService: boolean;
}

interface OverpassElement {
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat?: number; lon?: number };
  tags?: { name?: string; emergency?: string };
}

const SEARCH_RADIUS_METRES = 15000;
const MAX_RESULTS = 12;

/**
 * Looks up mapped hospitals only after the operator has explicitly shared a
 * device location. The app continues to work with its demo network if the
 * lookup is unavailable.
 */
export async function findNearbyHospitals(
  origin: Coordinates,
  signal?: AbortSignal
): Promise<NearbyHospital[]> {
  const query = `[out:json][timeout:12];nwr["amenity"="hospital"](around:${SEARCH_RADIUS_METRES},${origin.latitude},${origin.longitude});out center tags;`;
  const response = await fetch(
    `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`,
    { signal }
  );

  if (!response.ok) {
    throw new Error(`Nearby hospital lookup failed: ${response.status}`);
  }

  const payload = await response.json() as { elements?: OverpassElement[] };
  const seen = new Set<string>();

  return (payload.elements || [])
    .map((element): NearbyHospital | null => {
      const latitude = element.lat ?? element.center?.lat;
      const longitude = element.lon ?? element.center?.lon;
      const name = element.tags?.name?.trim();

      if (!name || latitude === undefined || longitude === undefined) return null;

      const coordinates = { latitude, longitude };
      const key = `${name}:${latitude.toFixed(4)}:${longitude.toFixed(4)}`;
      if (seen.has(key)) return null;
      seen.add(key);

      return {
        id: `osm-${element.id}`,
        name,
        coordinates,
        distanceKm: calculateDistanceKm(origin, coordinates),
        hasEmergencyService: element.tags?.emergency === 'yes'
      };
    })
    .filter((hospital): hospital is NearbyHospital => hospital !== null)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, MAX_RESULTS);
}
