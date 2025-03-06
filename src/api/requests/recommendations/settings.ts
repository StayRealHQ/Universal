import { BEREAL_DEFAULT_HEADERS } from "../../constants";
import { fetch } from "@tauri-apps/plugin-http";
import auth from "../../../stores/auth";
import { BeRealError } from "~/api/models/errors";

/** @see https://help.bereal.com/hc/en-us/articles/13264002869917-Contact-Syncing */
export type RecommendationSettingKey = (
  // NOTE: both toggles are inverted on the official UI
  // e.g.: toggling on "Contact sync" will set "noContactsSharing" to false
  | "hidePhoneNumber"   // = "Find me by phone number"
  | "noContactsSharing" // = "Contact sync"
);

export const patchRecommendationsSettings = async (key: RecommendationSettingKey, value: boolean): Promise<void> => {
  const response = await fetch("https://mobile-l7.bereal.com/api/recommendations/settings", {
    method: "PATCH",
    headers: {
      ...BEREAL_DEFAULT_HEADERS(auth.store.deviceId),
      authorization: `Bearer ${auth.store.accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ [key]: value })
  });

  // if token expired, refresh it and retry
  if (response.status === 401) {
    await auth.refresh();
    return patchRecommendationsSettings(key, value);
  }

  if (response.status !== 200) {
    throw new BeRealError("Failed to update settings");
  }
};
