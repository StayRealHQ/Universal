// /api/search/profile?query=some.dude&limit=20
import { fetch } from "@tauri-apps/plugin-http";
import { BEREAL_DEFAULT_HEADERS } from "~/api/constants";
import { ApiMedia } from "~/api/types/media";
import auth from "~/stores/auth";

export interface GetSearchProfile {
  data: Array<{
    id: string
    username: string
    fullname: string
    profilePicture: ApiMedia | null
    status: "sent" | null
    mutualFriends: number
    isRealPeople: boolean
  }>
}

export const getSearchProfile = async (query: string, limit = 20): Promise<GetSearchProfile> => {
  if (auth.isDemo()) {
    return { data: [] };
  }

  const response = await fetch(`https://mobile-l7.bereal.com/api/search/profile?query=${encodeURIComponent(query)}&limit=${limit}`, {
    headers: {
      ...BEREAL_DEFAULT_HEADERS(auth.store.deviceId),
      authorization: `Bearer ${auth.store.accessToken}`
    }
  });

  // if token expired, refresh it and retry
  if (response.status === 401) {
    await auth.refresh();
    return getSearchProfile(query, limit);
  }

  if (response.status !== 200) {
    throw new Error("failed to search profiles");
  }

  return response.json();
};
