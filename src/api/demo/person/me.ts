import type { PersonMe } from "~/api/requests/person/me";
import { DEMO_PHONE_NUMBER } from "~/utils/demo";

export const DEMO_PERSON_ME = {
  region: "europe-west",
  biography: "Hey ! I am a demonstration account, I am here to let you try the app. Blocking and reporting users won't do anything since friends are immutable here.",
  birthdate: "2000-12-25T00:00:00.000Z",
  canDeletePost: true,
  canPost: true,
  canUpdateRegion: true,
  countryCode: "FR",
  createdAt: "2025-01-27T20:05:00.000Z",
  customRealmoji: "",
  devices: [],
  fullname: "DEMO",
  gender: "MALE",
  id: "demo-123456",
  isPrivate: true,
  isRealPeople: false,
  links: [],
  location: "Paris",
  lastBtsPostAt: "2025-01-27T20:05:00.000Z",
  phoneNumber: DEMO_PHONE_NUMBER,
  profilePicture: null,
  realmojis: [],
  streakLength: 10,
  type: "USER",
  userFreshness: "returning",
  username: "demo",
} as PersonMe;

export const DEMO_PERSON_ME_DELETION_DATE = (): string => {
  const date = new Date();
  date.setDate(date.getDate() + 15);
  return date.toISOString();
};
