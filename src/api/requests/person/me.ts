import { BEREAL_DEFAULT_HEADERS, BEREAL_IOS_VERSION, BEREAL_PLATFORM, BEREAL_PLATFORM_VERSION, BEREAL_TIMEZONE } from "../../constants";
import { fetch } from "@tauri-apps/plugin-http";
import { ApiMedia } from "../../types/media";
import auth from "../../../stores/auth";
import { setRegion } from "@stayreal/api";

export class ProfileInexistentError extends Error {
  constructor() {
    super("profile does not exist, you should create one first");
    this.name = "ProfileInexistentError";
  }
}

export interface PersonMe {
  id: string
  username: string
  /** @example "2005-10-06T00:00:00.000Z" */
  birthdate: string
  fullname: string
  profilePicture: ApiMedia | null
  realmojis: Array<{
    emoji: string
    media: ApiMedia
  }>
  devices: Array<{
    clientVersion: string
    device: string
    deviceId: string
    platform: string
    language: string
    timezone: string
  }>
  canDeletePost: boolean
  canPost: boolean
  canUpdateRegion: boolean
  phoneNumber: string
  biography: string
  location: string
  countryCode: string
  /**
   * used to know which region to check for the bereal moment
   * @example "europe-west"
   */
  region: string
  /** @example "2024-04-12T22:07:19.431Z" */
  createdAt: string,
  isRealPeople: boolean
  userFreshness: "returning" | "new"
  streakLength: number
  /** @example "2024-10-14T10:05:31.618Z" */
  lastBtsPostAt: string
  type: "USER"
  links: Array<unknown>
  customRealmoji: "" // TODO: ??
  gender: "MALE" | "FEMALE" // not sure about the female one
  isPrivate: boolean
}

/**
 * Returns the profile of the current user.
 *
 * @throws `ProfileInexistentError` if the profile does not exist, in this
 * case you should do the onboarding process.
 */
export const person_me = async (): Promise<PersonMe> => {
  if (auth.isDemo()) {
    const { DEMO_PERSON_ME } = await import("~/api/demo/person/me");
    await setRegion(DEMO_PERSON_ME.region);
    return DEMO_PERSON_ME;
  }

  const response = await fetch("https://mobile-l7.bereal.com/api/person/me", {
    headers: {
      ...BEREAL_DEFAULT_HEADERS(auth.store.deviceId),
      authorization: `Bearer ${auth.store.accessToken}`
    }
  });

  // if token expired, refresh it and retry
  if (response.status === 401) {
    await auth.refresh();
    return person_me();
  }

  const json = await response.json();

  if (response.status === 404 && json.errorKey === "user-profile-not-found") {
    throw new ProfileInexistentError();
  }

  await setRegion(json.region);
  return json;
};

export interface PostPersonMe {
  id: string
  username: string
  /** @example "2005-10-06T00:00:00.000Z" */
  birthdate: string
  fullname: string
  profilePicture: ApiMedia | null
  realmojis: never[] // should always be empty...
  devices: Array<{
    clientVersion: string
    device: string
    deviceId: string
    platform: string
    language: string
    timezone: string
  }>
  canDeletePost: boolean
  canPost: boolean
  canUpdateRegion: boolean
  phoneNumber: string
  countryCode: string
  region: string
  createdAt: string
  isRealPeople: boolean
  userFreshness: "new"
  type: "USER"
  links: never[] // should always be empty...
  customRealmoji: string
  isPrivate: boolean
}

/**
 * Creates a new profile for the current user.
 * @param username The username to use for the new profile.
 * @param birthdate The birthdate of the user, in the format `YYYY-MM-DD`.
 * @param fullname The full name of the user.
 */
export const postPersonMe = async (username: string, birthdate: string, fullname: string): Promise<PostPersonMe> => {
  const response = await fetch("https://mobile-l7.bereal.com/api/person/me", {
    method: "POST",
    headers: {
      ...BEREAL_DEFAULT_HEADERS(auth.store.deviceId),
      authorization: `Bearer ${auth.store.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      platform: BEREAL_PLATFORM.toLowerCase(),
      deviceId: auth.store.deviceId,
      timezone: BEREAL_TIMEZONE,
      username,
      clientVersion: BEREAL_IOS_VERSION,
      // NOTE: constants to prevent any issues,
      //       this should not impact the account creation anyway.
      device: `iPhone15,3 ${BEREAL_PLATFORM_VERSION}`, // iPhone 15 Pro Max, should be updated time to time...
      language: "en",
      birthdate,
      fullname
    })
  });

  // if token expired, refresh it and retry
  if (response.status === 401) {
    await auth.refresh();
    return postPersonMe(username, birthdate, fullname);
  }

  if (response.status !== 201) {
    throw new Error("failed to create profile");
  }

  return response.json();
}
