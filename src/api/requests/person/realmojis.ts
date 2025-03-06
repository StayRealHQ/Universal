import { BEREAL_DEFAULT_HEADERS } from "~/api/constants"
import { fetch } from "@tauri-apps/plugin-http";
import auth from "~/stores/auth";
import { BeRealError } from "~/api/models/errors";

export interface GetPersonRealmojisUploadUrl {
  data: {
    /** @example "https://storage.googleapis.com/.../Photos/.../realmoji/..." */
    url: string
    expireAt: string
    bucket: string
    /** @example "Photos/:user_id/realmoji/:post_id.webp" */
    path: string
    /**
     * contains `cache-control`, `content-type` and `x-goog-content-length-range`
     */
    headers: Record<string, string>
  }
}

export const getPersonRealmojisUploadUrl = async (): Promise<GetPersonRealmojisUploadUrl> => {
  const response = await fetch("https://mobile-l7.bereal.com/api/person/realmojis/upload-url?mimeType=image/webp", {
    method: "GET",
    headers: {
      ...BEREAL_DEFAULT_HEADERS(auth.store.deviceId),
      authorization: `Bearer ${auth.store.accessToken}`
    }
  });

  // if token expired, refresh it and retry
  if (response.status === 401) {
    await auth.refresh();
    return getPersonRealmojisUploadUrl();
  }

  return response.json();
};

export const putPersonMeRealmojis = async (emoji: string, media: {
  height: number
  width: number
  path: string
  bucket: string
}): Promise<void> => {
  const response = await fetch("https://mobile-l7.bereal.com/api/person/me/realmojis", {
    method: "PUT",
    headers: {
      ...BEREAL_DEFAULT_HEADERS(auth.store.deviceId),
      authorization: `Bearer ${auth.store.accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      emoji,
      media
    })
  });

  // if token expired, refresh it and retry
  if (response.status === 401) {
    await auth.refresh();
    return putPersonMeRealmojis(emoji, media);
  }

  if (response.status !== 200) {
    throw new BeRealError("Failed to create reaction");
  }
}
