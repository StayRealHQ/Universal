import { fetch } from "@tauri-apps/plugin-http";
import { BEREAL_DEFAULT_HEADERS } from "~/api/constants";
import auth from "~/stores/auth";

// NOTE: it's requested when reporting a user/bereal but it's never used ?
export const getZendeskMyZendeskId = async (): Promise<string> => {
  const response = await fetch("https://mobile-l7.bereal.com/api/zendesk/my-zendesk-id", {
    headers: {
      ...BEREAL_DEFAULT_HEADERS(auth.store.deviceId),
      authorization: `Bearer ${auth.store.accessToken}`
    }
  });

  // if token expired, refresh it and retry
  if (response.status === 401) {
    await auth.refresh();
    return getZendeskMyZendeskId();
  }

  const json = await response.json() as {
    myZendeskId: string
  };

  return json.myZendeskId;
};
