import auth from "../../../../stores/auth";
import { BEREAL_DEFAULT_HEADERS } from "../../../constants";
import { fetch } from "@tauri-apps/plugin-http";
import { ApiMedia } from "../../../types/media";

export interface Friend {
  id: string
  username: string
  fullname: string
  profilePicture?: ApiMedia
  status: "accepted"
}

interface GetRelationshipsFriends {
  data: Array<Friend>
  next: string | null
  total: number
}

export const getRelationshipsFriends = async (pageId?: string): Promise<Array<Friend>> => {
  if (auth.isDemo()) {
    const { DEMO_RELATIONSHIPS_FRIENDS_LIST } = await import("~/api/demo/relationships/friends/list");
    return DEMO_RELATIONSHIPS_FRIENDS_LIST;
  }

  const url = new URL("https://mobile-l7.bereal.com/api/relationships/friends");
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
    return getRelationshipsFriends(pageId);
  }

  const json = await response.json() as GetRelationshipsFriends;

  if (json.next) {
    const next = await getRelationshipsFriends(json.next);
    return [...json.data, ...next];
  }

  return json.data;
};
