import { type JSXElement, type Component, createResource, Show } from "solid-js";
import auth from "../stores/auth";
import theme, { type ThemeMode } from "../stores/theme";
import { useNavigate } from "@solidjs/router";
import MdiChevronLeft from '~icons/mdi/chevron-left'
import MdiLogout from '~icons/mdi/logout'
import MdiGithub from '~icons/mdi/github'
import MdiDelete from '~icons/mdi/delete'
// import MdiEarth from '~icons/mdi/earth'
import MdiChevronRight from '~icons/mdi/chevron-right'
import MdiBlockHelper from '~icons/mdi/block-helper'
import MdiWeatherSunny from '~icons/mdi/weather-sunny'
import MdiWeatherNight from '~icons/mdi/weather-night'
import MdiMonitor from '~icons/mdi/monitor'
import { deletePersonMe, ProfileDeletionAlreadyScheduledError } from "~/api/requests/person/me";
import { confirm, message } from '@tauri-apps/plugin-dialog';
import { getVersion } from '@tauri-apps/api/app';
import { openUrl } from "@tauri-apps/plugin-opener";
// import me from "~/stores/me";

const Settings: Component = () => {
  const [version] = createResource(getVersion);
  const navigate = useNavigate();

  const getThemeIcon = (mode: ThemeMode): JSXElement => {
    switch (mode) {
      case "light":
        return <MdiWeatherSunny />;
      case "dark":
        return <MdiWeatherNight />;
      case "system":
        return <MdiMonitor />;
    }
  };

  const getThemeLabel = (mode: ThemeMode): string => {
    switch (mode) {
      case "light":
        return "Light";
      case "dark":
        return "Dark";
      case "system":
        return "System";
    }
  };

  const ThemeSelector: Component = () => {
    const themes: ThemeMode[] = ["light", "dark", "system"];
    
    return (
      <div class="flex flex-col gap-2">
        {themes.map((mode) => (
          <button
            type="button"
            onClick={() => theme.setTheme(mode)}
            class="flex items-center w-full px-4 py-3 rounded-lg"
            style={{
              "background-color": theme.themeMode() === mode ? "var(--overlay-strong)" : "var(--overlay)",
              "border": theme.themeMode() === mode ? "1px solid var(--border-primary)" : "none"
            }}
          >
            <div class="flex items-center gap-4">
              {getThemeIcon(mode)}
              <p class="font-medium">{getThemeLabel(mode)}</p>
            </div>
            <Show when={theme.themeMode() === mode}>
              <div class="ml-auto w-2 h-2 rounded-full" style={{"background-color": "var(--text-primary)"}} />
            </Show>
          </button>
        ))}
      </div>
    );
  };

  const Entry: Component<{ title: string, icon: JSXElement, chevron?: boolean, onClick: () => void }> = (props) => (
    <button
      type="button"
      onClick={props.onClick}
      class="flex items-center w-full px-4 py-3 rounded-lg"
      style={{"background-color": "var(--overlay)"}}
    >
      <div class="flex items-center gap-4">
        {props.icon}
        <p class="font-medium">{props.title}</p>
      </div>
      <Show when={props.chevron}>
        <MdiChevronRight class="ml-auto text-xl" style={{"color": "var(--text-secondary)"}} />
      </Show>
    </button>
  );

  return (
    <>
      <header class="pt-[env(safe-area-inset-top)]">
        <nav class="flex items-center justify-between px-4 h-[72px]">
          <a href="/profile" class="p-2.5 rounded-full ml-[-10px]" aria-label="Back to profile">
            <MdiChevronLeft class="text-2xl" />
          </a>
        </nav>
      </header>

      <div class="p-4">
        <section class="flex flex-col gap-2">
          <h2 class="uppercase font-bold text-sm" style={{"color": "var(--text-secondary)"}}>Appearance</h2>
          <ThemeSelector />
        </section>

        <section class="flex flex-col gap-2">
          <h2 class="uppercase font-bold text-sm mt-6" style={{"color": "var(--text-secondary)"}}>Privacy</h2>

          <Entry title="Blocked Users" icon={<MdiBlockHelper />} onClick={() => {
            navigate("/settings/blocked-users");
          }} chevron />

          {/* <Entry title={`Timezone: ${me.get()?.region}`} icon={<MdiEarth />} onClick={() => {
            navigate("/settings/timezone");
          }} chevron /> */}
        </section>

        <section class="flex flex-col gap-2">
          <h2 class="uppercase font-bold text-sm mt-6" style={{"color": "var(--text-secondary)"}}>Other</h2>

          <Entry title="Report an issue on GitHub" icon={<MdiGithub />} onClick={() => {
            openUrl("https://github.com/StayRealHQ/Universal/issues");
          }} />

          <Entry title="Request account deletion" icon={<MdiDelete />} onClick={async () => {
            const confirmation = await confirm("You will be logged out immediately and your account and all your data will be scheduled to be permanently deleted in 15 days.\n\nIf you log in within those 15 days, your account will no longer be deleted.", {
              title: "So, you want to delete your account?",
              kind: 'warning',
              cancelLabel: "I changed my mind",
              okLabel: "Yes, I'm sure"
            });

            if (!confirmation) return;

            try {
              const deletion = await deletePersonMe();
              await message(`Your account has been scheduled for deletion: ${new Date(deletion.accountDeleteScheduledAt).toLocaleString()}`);
            }
            catch (error) {
              if (error instanceof ProfileDeletionAlreadyScheduledError) {
                await message("Your account is already scheduled for deletion", { kind: 'warning' });
                navigate("/");
              }
              else {
                await message("Failed to delete your account, please try again later", { kind: 'error' });
                return;
              }
            }

            await auth.logout();
            navigate("/");
          }} />
        </section>

        <button type="button" class="mt-6 mb-4 text-red flex items-center font-medium justify-center gap-2 w-full p-4 rounded-lg"
          style={{"background-color": "var(--overlay)"}}
          onClick={async () => {
            await auth.logout();
            navigate("/");
          }}
        >
          <MdiLogout /> Log Out
        </button>

        <p class="text-center font-medium text-sm" style={{"color": "var(--text-secondary)"}}>Version {version()}</p>
      </div>
    </>
  )
};

export default Settings;
