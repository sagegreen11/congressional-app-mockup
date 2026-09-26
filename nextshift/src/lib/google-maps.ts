export type TravelMode = 'walk' | 'bus' | 'train';

export function googlePlaceEmbedUrl(query: string): string {
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=13&hl=en&output=embed`;
}

export function googleDirectionsEmbedUrl(destination: string, mode: TravelMode): string {
  const dirflg = mode === 'walk' ? 'w' : 'r';
  return `https://maps.google.com/maps?saddr=Current+Location&daddr=${encodeURIComponent(
    destination,
  )}&dirflg=${dirflg}&hl=en&output=embed`;
}

export function googleDirectionsAppUrl(destination: string, mode: TravelMode): string {
  const travelmode = mode === 'walk' ? 'walking' : 'transit';
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}&travelmode=${travelmode}`;
}
