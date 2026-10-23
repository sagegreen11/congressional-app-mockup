import { jobs } from '@/data/jobs';
import type { TravelMode } from '@/lib/google-maps';

export type Coords = { lat: number; lng: number };

export const BERGEN_ORIGIN: Coords = { lat: 40.8859, lng: -74.0435 };

const CITY_COORDS: Record<string, Coords> = {
  'saddle brook': { lat: 40.898, lng: -74.093 },
  edgewater: { lat: 40.827, lng: -73.974 },
  'south hackensack': { lat: 40.863, lng: -74.048 },
  'east rutherford': { lat: 40.834, lng: -74.097 },
  bogota: { lat: 40.876, lng: -74.03 },
  teaneck: { lat: 40.893, lng: -74.012 },
  englewood: { lat: 40.893, lng: -73.973 },
  secaucus: { lat: 40.79, lng: -74.057 },
  'jersey city': { lat: 40.728, lng: -74.078 },
  maywood: { lat: 40.903, lng: -74.062 },
  clifton: { lat: 40.858, lng: -74.164 },
  leonia: { lat: 40.861, lng: -73.988 },
  cresskill: { lat: 40.941, lng: -73.964 },
  wyckoff: { lat: 41.009, lng: -74.172 },
  'midland park': { lat: 40.989, lng: -74.141 },
  bronx: { lat: 40.809, lng: -73.877 },
  'pompton plains': { lat: 40.967, lng: -74.294 },
  hackensack: BERGEN_ORIGIN,
  paramus: { lat: 40.945, lng: -74.075 },
  'fort lee': { lat: 40.851, lng: -73.97 },
  garfield: { lat: 40.881, lng: -74.113 },
};

function toRad(value: number) {
  return (value * Math.PI) / 180;
}

function haversineKm(from: Coords, to: Coords) {
  const earth = 6371;
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * earth * Math.asin(Math.min(1, Math.sqrt(a)));
}

function formatMinutes(minutes: number) {
  const min = Math.max(4, Math.round(minutes));
  if (min < 60) return `${min} min`;
  const hours = Math.floor(min / 60);
  const rest = min % 60;
  if (rest === 0) return `${hours} hr`;
  return `${hours} hr ${rest} min`;
}

export function estimateTravelTimes(from: Coords, to: Coords): Record<TravelMode, string> {
  const km = haversineKm(from, to);
  const walkKm = km * 1.28;
  const roadKm = km * 1.38;

  return {
    walk: formatMinutes((walkKm / 4.8) * 60),
    bus: formatMinutes(7 + (roadKm / 19) * 60),
    train: formatMinutes(16 + (roadKm / 42) * 60),
  };
}

export function coordsForDestination(address?: string, name?: string): Coords {
  const job =
    jobs.find((item) => item.location === address) ||
    jobs.find((item) => item.employer === name) ||
    jobs.find((item) => name && item.employer.toLowerCase().includes(name.toLowerCase())) ||
    jobs.find((item) => address && item.city && address.toLowerCase().includes(item.city.toLowerCase()));

  if (job) return { lat: job.lat, lng: job.lng };

  const haystack = `${address ?? ''} ${name ?? ''}`.toLowerCase();
  const city = Object.keys(CITY_COORDS)
    .sort((a, b) => b.length - a.length)
    .find((key) => haystack.includes(key));
  return city ? CITY_COORDS[city] : BERGEN_ORIGIN;
}

export function readDeviceOrigin(): Promise<Coords> {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      resolve(BERGEN_ORIGIN);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }),
      () => resolve(BERGEN_ORIGIN),
      { enableHighAccuracy: false, timeout: 2500, maximumAge: 120000 },
    );
  });
}
