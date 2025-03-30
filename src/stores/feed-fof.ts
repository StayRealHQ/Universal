import { createRoot, createSignal } from "solid-js";
import { getFeedsFriendsOfFriends, type FriendsOfFriendsPost } from "~/api/requests/feeds/friends-of-friends";
import auth from "./auth";

export default createRoot(() => {
  const [get, _set] = createSignal<Array<FriendsOfFriendsPost>>();
  const refetch = () => getFeedsFriendsOfFriends().then(set);

  const set = (value: Array<FriendsOfFriendsPost>): void => {
    // Yeah, we're doing a deep copy in demo mode
    // because references kinda messes up the
    // reactivity system.
    if (auth.isDemo()) value = structuredClone(value);

    _set(value);
  };

  const clear = (): void => {
    _set(void 0);
  }

  return { get, set, clear, refetch };
});
