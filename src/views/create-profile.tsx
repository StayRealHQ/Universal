import { useNavigate } from "@solidjs/router";
import { openUrl } from "@tauri-apps/plugin-opener";
import { createMemo, createSignal, Show, type Component } from "solid-js";
import { postPersonMe } from "~/api/requests/person/me";
import { type PersonProfilesUsernameCheck, getPersonProfilesUsernameCheck } from "~/api/requests/person/username-check";

const CreateProfileView: Component = () => {
  const navigate = useNavigate();

  const [usernameLoading, setUsernameLoading] = createSignal(false);
  const [creationLoading, setCreationLoading] = createSignal(false);

  const [fullName, setFullName] = createSignal("");
  const [username, setUsername] = createSignal("");
  const [birthdate, setBirthdate] = createSignal("");
  const [usernameCheck, setUsernameCheck] = createSignal<PersonProfilesUsernameCheck>();

  const handleProfileCreation = async (event: SubmitEvent): Promise<void> => {
    event.preventDefault();

    try {
      setCreationLoading(true);

      await postPersonMe(username(), birthdate(), fullName());
      navigate("/feed/friends");
    }
    finally {
      setCreationLoading(false);
    }
  }

  const handleUsernameChange = async (event: InputEvent): Promise<void> => {
    try {
      setUsernameLoading(true);

      const username = (event.currentTarget as HTMLInputElement).value.trim().toLowerCase();
      setUsername(username);
      if (!username) return;

      const usernameCheck = await getPersonProfilesUsernameCheck(username, fullName());
      setUsernameCheck(usernameCheck);
    }
    finally {
      setUsernameLoading(false);
    }
  };

  const isUsernameValid = createMemo(() => {
    const check = usernameCheck();
    if (!check || check.exists) return false;
    if (check.username !== username()) return false;

    if (check.availableUsernames.includes(check.username)) return true;
    return false;
  });

  return (
    <main class="h-100dvh flex flex-col px-4 py-6">
      <header class="flex items-center relative w-full h-8 mt-[env(safe-area-inset-top)]">
        <div class="absolute inset-x-0 w-fit mx-auto text-2xl text-center text-white font-700" role="banner">
          StayReal.
        </div>
      </header>

      <div class="flex flex-col items-center my-10 text-center gap-2">
        <h1 class="font-600">
          Create a profile
        </h1>
        <p class="text-xs opacity-60">By creating an account, you agree to <br/>
          <button
            type="button"
            onClick={() => openUrl("https://bereal.com/terms/")}
            class="hover:text-white/80 underline underline-offset-2 transition-colors"
          >
              BeReal's Terms of Service
          </button>
        </p>
      </div>

      <form class="flex flex-col gap-6 h-full mb-[env(safe-area-inset-bottom)]" onSubmit={handleProfileCreation}>
        <label class="flex flex-col gap-2 w-full max-w-280px mx-auto">
          <span class="text-lg font-500">Full name</span>
          <input
            required
            class="w-full rounded-2xl py-3 px-4 text-white bg-white/5 text-2xl font-400 tracking-wide outline-none placeholder:text-white/40 focus:(outline outline-white outline-offset-2)"
            type="text"
            name="fullname"
            placeholder="John DOE"
            onInput={(event) => setFullName(event.currentTarget.value)}
            value={fullName()}
          />
        </label>

        <label class="flex flex-col gap-2 w-full max-w-280px mx-auto">
          <span class="text-lg font-500">Username</span>
          <input
            required
            class="w-full rounded-2xl py-3 px-4 text-white bg-white/5 text-2xl font-400 tracking-wide outline-none placeholder:text-white/40 focus:(outline outline-white outline-offset-2)"
            type="text"
            name="username"
            placeholder="john.doe"
            onInput={handleUsernameChange}
            value={username()}
          />
        </label>

        <div class="text-center text-sm text-white/50 -mt-2">
          <Show when={!usernameLoading()} fallback={<p>Checking username...</p>}>
            <p>
              Your username is {isUsernameValid() ? "valid" : "invalid"}
            </p>
          </Show>
        </div>

        <Show when={isUsernameValid()}>
          <label class="flex flex-col gap-2 w-full max-w-280px mx-auto ">
            <span class="text-lg font-500">Birth date</span>
            <input
              required
              class="w-full rounded-2xl py-3 px-4 text-white bg-white/5 text-2xl font-400 tracking-wide outline-none placeholder:text-white/40 focus:(outline outline-white outline-offset-2)"
              type="date"
              name="birthdate"
              onInput={(event) => setBirthdate(event.currentTarget.value)}
              value={birthdate()}
            />
          </label>

          <button
            type="submit"
            disabled={!birthdate() || creationLoading()}
            class="text-black bg-white rounded-2xl w-full py-3 mt-auto focus:(outline outline-white outline-offset-2) disabled:opacity-30"
          >
            Join
          </button>
        </Show>
      </form>
    </main>
  )
};

export default CreateProfileView;
