import { createRoot } from "solid-js";
import { getFeedsFriendsOfFriends, type FriendsOfFriendsPost } from "~/api/requests/feeds/friends-of-friends";
import auth from "./auth";
import { createStore, reconcile } from "solid-js/store";

export default createRoot(() => {
  const [get, _set] = createStore({ value: void 0 as Array<FriendsOfFriendsPost> | undefined });
  const refetch = () => getFeedsFriendsOfFriends().then(set);

  const set = (value: Array<FriendsOfFriendsPost>): void => {
    // Yeah, we're doing a deep copy in demo mode
    // because references kinda messes up the
    // reactivity system.
    if (auth.isDemo()) value = structuredClone(value);

    _set("value", reconcile(value));
  };

  const clear = (): void => {
    _set("value", void 0);
  }

  return { get: () => get.value, set, clear, refetch };
});
