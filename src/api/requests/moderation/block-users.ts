import { fetch } from "@tauri-apps/plugin-http";
import { BEREAL_DEFAULT_HEADERS } from "~/api/constants";
import { BeRealError } from "~/api/models/errors";
import auth from "~/stores/auth";

export interface GetModerationBlockUsers {
  data: Array<{
    userId: string
    blockedAt: string
    user: {
      id: string
      username: string
      fullname: string
    }
  }>
}

/** Get a full list of already blocked users. */
export const getModerationBlockUsers = async (): Promise<GetModerationBlockUsers> => {
  const response = await fetch(`https://mobile-l7.bereal.com/api/moderation/block-users?page`, {
    method: "GET",
    headers: {
      ...BEREAL_DEFAULT_HEADERS(auth.store.deviceId),
      authorization: `Bearer ${auth.store.accessToken}`
    }
  });

  // if token expired, refresh it and retry
  if (response.status === 401) {
    await auth.refresh();
    return getModerationBlockUsers();
  }

  return response.json();
};

/** Block a given user with their ID. */
export const postModerationBlockUsers = async (userId: string): Promise<void> => {
  const response = await fetch(`https://mobile-l7.bereal.com/api/moderation/block-users`, {
    method: "POST",
    headers: {
      ...BEREAL_DEFAULT_HEADERS(auth.store.deviceId),
      authorization: `Bearer ${auth.store.accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      blockedUserId: userId
    })
  });

  // if token expired, refresh it and retry
  if (response.status === 401) {
    await auth.refresh();
    return postModerationBlockUsers(userId);
  }

  if (response.status !== 201) {
    throw new BeRealError("Failed to block user");
  }
};

/** Unblock a given user with their ID. */
export const deleteModerationBlockUsers = async (userId: string): Promise<void> => {
  const response = await fetch(`https://mobile-l7.bereal.com/api/moderation/block-users/${userId}`, {
    method: "DELETE",
    headers: {
      ...BEREAL_DEFAULT_HEADERS(auth.store.deviceId),
      authorization: `Bearer ${auth.store.accessToken}`
    }
  });

  // if token expired, refresh it and retry
  if (response.status === 401) {
    await auth.refresh();
    return deleteModerationBlockUsers(userId);
  }

  if (response.status !== 200) {
    throw new BeRealError("Failed to unblock user");
  }
};
