import { fetch } from "@tauri-apps/plugin-http";
import auth from "~/stores/auth"
import { BEREAL_DEFAULT_HEADERS } from "~/api/constants";
import type { PostsOverview } from "./friends";
import { ApiMedia } from "~/api/types/media";

export interface FriendsOfFriendsPost {
  id: string
  user: {
    id: string
    username: string
    profilePicture: ApiMedia | null
    relationship: {
      commonFriends: Array<{
        id: string
        username: string
        fullname: string
        profilePicture: ApiMedia | null
      }>
    }
  }

  moment: {
    id: string
    region: string
  }

  primary: ApiMedia & {
    mediaType: string
    mimeType: string
  }

  secondary: ApiMedia & {
    mediaType: string
    mimeType: string
  }

  takenAt: string
  postedAt: string
  lateInSeconds: number

  caption?: string

  location?: {
    latitude: number
    longitude: number
  }

  realmojis: {
    total: number,
    self?: {
      id: string
      user?: {
        id: string
        username: string
      }
      media: ApiMedia
      emoji: string
      isInstant: boolean
      postedAt: string
    }
    sample: Array<{
      id: string
      user?: {
        id: string
        username: string
      }
      media: ApiMedia
      emoji: string
      isInstant: boolean
      postedAt: string
    }>
  }

  tags: Array<{
    user: {
      id: string
      username: string
      profilePicture: ApiMedia | null
      fullname: string
      type: "USER"
    }
    userId: string
    replaceText: string
    searchText: string
    endIndex: number
    isUntagged: boolean
    type: "tag"
  }>
}

export interface GetFeedsFriendsOfFriends {
  data: Array<FriendsOfFriendsPost>
  next: string
}

export const getFeedsFriendsOfFriends = async (pageId?: string): Promise<Array<FriendsOfFriendsPost>> => {
  const url = new URL("https://mobile-l7.bereal.com/api/feeds/friends-of-friends");
  if (pageId) {
    url.searchParams.set("page", pageId);
  }

  const response = await fetch(url, {
    headers: {
      ...BEREAL_DEFAULT_HEADERS(auth.store.deviceId),
      authorization: `Bearer ${auth.store.accessToken}`
    }
  });

  // if token expired, refresh it and retry
  if (response.status === 401) {
    await auth.refresh();
    return getFeedsFriendsOfFriends();
  }

  const json = await response.json() as GetFeedsFriendsOfFriends;

  if (json.next) {
    const next = await getFeedsFriendsOfFriends(json.next);
    return [...json.data, ...next];
  }

  return json.data;
}
