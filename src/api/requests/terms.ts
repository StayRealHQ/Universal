import { fetch } from "@tauri-apps/plugin-http";
import { BEREAL_DEFAULT_HEADERS } from "../constants";
import auth from "../../stores/auth";
import { BeRealError } from "../models/errors";

export type TermCode = (
  | "gps"
  | "memories"
  | "terms"
  | "privacy"
  | "camera"
  | "contacts"
  | "microphone"
  | "apple-music"
  | "photo-library-read"
  | "photo-library-write"
  | "screen-recording"
  | "push-notifications"
  | "show-friends-to-friends" // = Settings > Friends of Friends > "Connect with friends"
);

export type TermStatus = (
  | "UNKNOWN"
  | "ACCEPTED"
  | "DECLINED"
);

export type Term = {
  code: TermCode
  status: "ACCEPTED" | "UNKNOWN" | "DECLINED"
  signedAt: string
  termUrl: string
  version: string
}

export interface GetTerms {
  data: Array<Term>
}

export const getTerms = async (): Promise<GetTerms> => {
  const response = await fetch("https://mobile-l7.bereal.com/api/terms", {
    method: "GET",
    headers: {
      ...BEREAL_DEFAULT_HEADERS(auth.store.deviceId),
      authorization: `Bearer ${auth.store.accessToken}`
    }
  });

  // if token expired, refresh it and retry
  if (response.status === 401) {
    await auth.refresh();
    return getTerms();
  }

  return response.json();
};

export const putTerms = async (code: TermCode, status: TermStatus): Promise<Term> => {
  const response = await fetch(`https://mobile-l7.bereal.com/api/terms/${code}`, {
    method: "PUT",
    headers: {
      ...BEREAL_DEFAULT_HEADERS(auth.store.deviceId),
      authorization: `Bearer ${auth.store.accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ status })
  });

  // if token expired, refresh it and retry
  if (response.status === 401) {
    await auth.refresh();
    return putTerms(code, status);
  }

  if (response.status !== 200) {
    throw new BeRealError(`Failed to update terms for '${code}'`);
  }

  return response.json();
};
