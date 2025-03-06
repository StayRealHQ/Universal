import { BEREAL_DEFAULT_HEADERS } from "../../constants";
import { fetch } from "@tauri-apps/plugin-http";
import auth from "../../../stores/auth";

export type GetBerealRegions = Array<{
  code: string
  name: string
}>

/**
 * Retrieve a list of available regions.
 */
export const getBerealRegions = async (): Promise<GetBerealRegions> => {
  const response = await fetch("https://mobile-l7.bereal.com/api/bereal/regions?language=en", {
    headers: {
      ...BEREAL_DEFAULT_HEADERS(auth.store.deviceId),
      authorization: `Bearer ${auth.store.accessToken}`
    }
  });

  // if token expired, refresh it and retry
  if (response.status === 401) {
    await auth.refresh();
    return getBerealRegions();
  }

  return response.json();
};
