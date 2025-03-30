import { fetch } from "@tauri-apps/plugin-http";

export type ReverseGeocoding = {
  address: {
    city?: string
    village?: string
    municipality: string
    country: string
    town?: string
  }
}

const cached = (latitude: number, longitude: number): ReverseGeocoding | undefined => {
  const cache = JSON.parse(localStorage.getItem(`geocoding`) || "{}")
  return cache[`${latitude},${longitude}`];
}

const cache = (latitude: number, longitude: number, geocoding: ReverseGeocoding) => {
  const cache = JSON.parse(localStorage.getItem(`geocoding`) || "{}")
  cache[`${latitude},${longitude}`] = geocoding;
  localStorage.setItem(`geocoding`, JSON.stringify(cache));
}

export const reverseGeocoding = async (latitude: number, longitude: number): Promise<ReverseGeocoding> => {
  const pre = cached(latitude, longitude);
  if (pre) return pre;

  const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`)

  // too many requests,
  if (response.status !== 200) {
    // wait for a second and retry
    await new Promise(resolve => setTimeout(resolve, 1000));
    return reverseGeocoding(latitude, longitude);
  }

  const output = await response.json() as ReverseGeocoding;
  cache(latitude, longitude, output);
  return output;
};
