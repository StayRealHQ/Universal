import { createRoot, onMount } from "solid-js";
import { createStore } from "solid-js/store";
import { refreshToken, getAuthDetails, type AuthDetails, setAuthDetails, clearAuthDetails } from "tauri-plugin-bereal-api";
import { wait } from "../utils/wait";

export default createRoot(() => {
  const [store, setStore] = createStore<{ loading: boolean } & AuthDetails>({
    loading: true,
    deviceId: "",
    accessToken: "",
    refreshToken: "",
  });

  const refresh = async (retry = 0): Promise<void> => {
    try {
      await refreshToken(); // refresh it natively
      const mutation = await getAuthDetails();
      setStore({ ...mutation });
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
        console.error("auth.refresh:", error);
        // TODO: show a toast telling the user to restart the app in a few minutes or when back online
      }
    }
  };

  const save = async (mutation: AuthDetails) => {
    await setAuthDetails(mutation);
    setStore(mutation);
  };

  const logout = async () => {
    await clearAuthDetails();
    setStore({
      loading: false,
      deviceId: "",
      accessToken: "",
      refreshToken: "",
    });
  }

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

  return { store, save, refresh, logout };
});
