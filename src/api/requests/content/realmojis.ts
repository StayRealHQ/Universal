import { ApiMedia } from "~/api/types/media";
import auth from "../../../stores/auth";
import { BEREAL_DEFAULT_HEADERS } from "../../constants";
import { fetch } from "@tauri-apps/plugin-http";
import { BeRealError } from "~/api/models/errors";

export type RealmojisPut = {
  id: string
  user: {
    id: string
    username: string
    profilePicture?: ApiMedia
    type: "USER"
  }
  emoji: string
  isInstant: boolean
  media: ApiMedia
  /** @example "2025-01-21T21:30:56.125Z" */
  postedAt: string
}

export const content_realmojis_put = async (postId: string, postUserId: string, emoji: string): Promise<void> => {
  const response = await fetch(`https://mobile-l7.bereal.com/api/content/realmojis?postId=${postId}&postUserId=${postUserId}`, {
    method: "PUT",
    headers: {
      ...BEREAL_DEFAULT_HEADERS(auth.store.deviceId),
      authorization: `Bearer ${auth.store.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ emoji }),
  });

  if (response.status !== 200) {
    throw new BeRealError("Failed to add reaction.");
  }
}

export const content_realmojis_delete = async (postId: string, postUserId: string, realmoji_id: string): Promise<void> => {
  const response = await fetch(`https://mobile-l7.bereal.com/api/content/realmojis?postId=${postId}&postUserId=${postUserId}`, {
    method: "DELETE",
    headers: {
      ...BEREAL_DEFAULT_HEADERS(auth.store.deviceId),
      authorization: `Bearer ${auth.store.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ realmojiIds: [realmoji_id] }),
  });

  if (response.status !== 200) {
    throw new BeRealError("Failed to remove reaction.");
  }
}
