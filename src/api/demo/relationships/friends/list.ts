import type { Friend } from "~/api/requests/relationships/friends/list";

export const DEMO_RELATIONSHIPS_FRIENDS_LIST = [
  {
    id: "alice-123456",
    username: "alice",
    fullname: "Alice",
    status: "accepted"
  },
  {
    id: "mike-123456",
    username: "mike",
    fullname: "Mike",
    status: "accepted"
  },
] as Array<Friend>
