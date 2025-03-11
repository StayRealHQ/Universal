import { createRoot, onMount } from "solid-js";
import { createStore } from "solid-js/store";
import { refreshToken, getAuthDetails, type AuthDetails, setAuthDetails, clearAuthDetails } from "@stayreal/api";
import { wait } from "../utils/wait";
import feed from "./feed";
import me from "./me";
import { DEMO_ACCESS_TOKEN, DEMO_REFRESH_TOKEN } from "~/utils/demo";
import toast from "solid-toast";

export default createRoot(() => {
  const [store, setStore] = createStore<{ loading: boolean } & AuthDetails>({
    loading: true,
    deviceId: "",
    accessToken: "",
    refreshToken: "",
  });

  const refresh = async (retry = 0): Promise<void> => {
    try {
      if (isDemo()) {
        setStore({
          accessToken: DEMO_ACCESS_TOKEN,
          refreshToken: DEMO_REFRESH_TOKEN(store.refreshToken) // should increase of 1
        });
      }
      else {
        await refreshToken(); // refresh it natively
        const mutation = await getAuthDetails();
        setStore({ ...mutation });
      }
    }
    catch (error) {
      // we might be limited by the API sometimes, we receive a 400 error
      // so we retry a few times before giving up
      if (retry < 2) {
        console.info(`auth.refresh[retry=${retry}]: failed, retrying in 1s`);

        await wait(1000);
        return refresh(retry + 1);
      }
      else {
        toast.error("Couldn't connect you to the servers, please retry later.");
      }
    }
  };

  const save = async (mutation: AuthDetails) => {
    await setAuthDetails(mutation);
    setStore(mutation);
  };

  const clear = async () => {
    await clearAuthDetails();
    setStore({
      loading: false,
      deviceId: "",
      accessToken: "",
      refreshToken: "",
    });
  }

  const logout = async () => {
    me.clear();
    feed.clear();
    await clear();
  };

  const isDemo = () => store.accessToken === DEMO_ACCESS_TOKEN;

  onMount(async () => {
    try {
      const tokens = await getAuthDetails();
      setStore({
        loading: false,
        ...tokens
      });
    }
    catch { // probably never authenticated before
      setStore({ loading: false });
    }
  });

  return { store, save, refresh, logout, isDemo };
});
