import { createRoot } from "solid-js";
import { getFeedsFriends, type GetFeedsFriends } from "~/api/requests/feeds/friends";
import auth from "./auth";
import { createStore, reconcile } from "solid-js/store";

export default createRoot(() => {
  const STORAGE_KEY = "feeds_friends";
  const INITIAL_DATA = localStorage.getItem(STORAGE_KEY);

  const [get, _set] = createStore({
    value: INITIAL_DATA ? <GetFeedsFriends>JSON.parse(INITIAL_DATA) : null
  });

  const refetch = () => getFeedsFriends().then(set);

  const set = (value: GetFeedsFriends): void => {
    try {
      // We don't want to preserve the data in demo mode.
      if (!auth.isDemo()) localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    } catch { /** NO-OP */}

    // Yeah, we're doing a deep copy in demo mode
    // because references kinda messes up the
    // reactivity system.
    if (auth.isDemo()) value = structuredClone(value);

    _set("value", reconcile(value));
  };

  const clear = (): void => {
    localStorage.removeItem(STORAGE_KEY);
    _set("value", null);
  }

  return { get: () => get.value, set, clear, refetch };
});
