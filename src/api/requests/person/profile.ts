import { BEREAL_DEFAULT_HEADERS } from "~/api/constants";
import { fetch } from "@tauri-apps/plugin-http";
import { ApiMedia } from "~/api/types/media";
import auth from "~/stores/auth";
import { BeRealError } from "~/api/models/errors";

export interface PersonProfile {
  biography: string;
  location: string;
  id: string
  username: string
  fullname: string
  profilePicture: ApiMedia | null
  relationship: {
    status: "pending" | "accepted"
    commonFriends: {
      sample: {
        id: string;
        fullname: string;
        username: string;
        profilePicture: ApiMedia | null;
      }[];
      total: number
    }
    friendedAt: string
  }
  createdAt: string
  isRealPeople: boolean
  beRealOfTheDay: { postExists: boolean }
  userFreshness: "returning" | "new"
  streakLength: number
  type: "USER"
  links: Array<unknown>
  isPrivate: boolean
}

export class PersonNotFoundError extends BeRealError {
  constructor() {
    super("User not found");
    this.name = "PersonNotFoundError";
  }
}

export const person_profile = async (id: string): Promise<PersonProfile> => {
  const response = await fetch(`https://mobile-l7.bereal.com/api/person/profiles/${id}?withPost=true`, {
    headers: {
      ...BEREAL_DEFAULT_HEADERS(auth.store.deviceId),
      authorization: `Bearer ${auth.store.accessToken}`
    }
  });

  // if token expired, refresh it and retry
  if (response.status === 401) {
    await auth.refresh();
    return person_profile(id);
  }

  if (response.status === 404) {
    throw new PersonNotFoundError();
  }

  return response.json();
};
