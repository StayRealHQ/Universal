import { ApiMedia } from "~/api/types/media";
import auth from "~/stores/auth";
import { BEREAL_DEFAULT_HEADERS } from "../../../constants";
import { fetch } from "@tauri-apps/plugin-http";

export interface RelationshipsFriendsReceived {
  data: Array<{
    id: string
    username: string
    fullname: string
    profilePicture?: ApiMedia
    status: "pending"
    mutualFriends: number
    updatedAt: string
  }>
  next: string | null
}

export const relationships_friends_received = async (): Promise<RelationshipsFriendsReceived> => {
  const response = await fetch("https://mobile-l7.bereal.com/api/relationships/friend-requests/received?page", {
    headers: {
      ...BEREAL_DEFAULT_HEADERS(auth.store.deviceId),
      authorization: `Bearer ${auth.store.accessToken}`
    }
  });

  // if token expired, refresh it and retry
  if (response.status === 401) {
    await auth.refresh();
    return relationships_friends_received();
  }

  return response.json()
};
