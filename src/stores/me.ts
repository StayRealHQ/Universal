import { ask } from "@tauri-apps/plugin-dialog";
import { createRoot, createSignal } from "solid-js";
import { person_me, type PersonMe } from "~/api/requests/person/me";
import auth from "./auth";
import { patchPersonMeCancelDelete } from "~/api/requests/person/me/cancel-delete";

/**
 * A small signal store to keep track
 * of the current user details.
 */
export default createRoot(() => {
  const STORAGE_KEY = "person_me";
  const INITIAL_DATA = localStorage.getItem(STORAGE_KEY);

  const [get, _set] = createSignal(INITIAL_DATA ? <PersonMe>JSON.parse(INITIAL_DATA) : null);
  const refetch = async () => {
    const me = await person_me();

    // Update the local storage and the signal.
    set(me);

    // Check if account deletion is scheduled.
    if (me.accountDeleteScheduledAt) {
      const answer = await ask(`Your account is scheduled for deletion on ${new Date(me.accountDeleteScheduledAt).toLocaleString()}. Deletion is permanent. If you change your mind, tap on Login and Cancel Deletion.`, {
        kind: "warning",
        okLabel: "Login and Cancel Deletion",
        cancelLabel: "Logout",
      });

      if (!answer) { // = logout
        await auth.logout();

        // Since we can't use `navigate` here,
        // we redirect the user to the login page manually.
        location.replace("/login");
      }
      else { // = cancel deletion
        await patchPersonMeCancelDelete();
        await refetch();
      }
    }
  };

  const set = (value: PersonMe): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    _set(value);
  };

  const clear = (): void => {
    localStorage.removeItem(STORAGE_KEY);
    _set(null);
  };

  return { get, set, clear, refetch };
});
