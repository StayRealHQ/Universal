import { invoke } from '@tauri-apps/api/core';

export type NotificationPermissionStatus = {
  status: 'prompt' | 'denied' | 'granted'
}

export interface AuthDetails {
  deviceId: string;
  accessToken: string;
  refreshToken: string;
}

export interface Moment {
  id: string
  region: string
  startDate: string
  endDate: string
}

export async function setAuthDetails(payload: AuthDetails): Promise<void> {
  return invoke('plugin:internal-api|set_auth_details', {
    payload
  });
}

export async function getAuthDetails(): Promise<AuthDetails> {
  return invoke('plugin:internal-api|get_auth_details');
}

export async function clearAuthDetails(): Promise<void> {
  return invoke('plugin:internal-api|clear_auth_details');
}

export async function refreshToken(): Promise<void> {
  return invoke('plugin:internal-api|refresh_token');
}

export async function setRegion(region: string): Promise<void> {
  return invoke('plugin:internal-api|set_region', {
    payload: { region }
  });
}

export async function fetchLastMoment(): Promise<Moment> {
  return invoke('plugin:internal-api|fetch_last_moment');
}

export async function convertJpegToWebp(jpeg: Uint8Array): Promise<Uint8Array> {
  const bytes = await invoke<number[]>('plugin:internal-api|convert_jpeg_to_webp', {
    payload: { jpeg }
  });

  return Uint8Array.from(bytes);
}

export async function compressWebpToSize(webp: Uint8Array, maxSize: number): Promise<Uint8Array> {
  const bytes = await invoke<number[]>('plugin:internal-api|compress_webp_to_size', {
    payload: { webp, maxSize }
  });

  return Uint8Array.from(bytes);
}

export async function requestPermissions(): Promise<NotificationPermissionStatus> {
  return await invoke('plugin:internal-api|request_permissions')
}
