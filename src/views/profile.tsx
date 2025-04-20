import { For, onMount, Show, type Component } from "solid-js";
import MdiCog from '~icons/mdi/cog'
import me from "~/stores/me";
import ProfilePicture from "~/components/profile-picture";
import BottomNavigation from "~/components/bottom-navigation";

const Chip: Component<{ content: string }> = (props) => (
  <div class="bg-white/15 rounded-full py-1.5 px-2.5">
    <p class="text-xs sm:text-sm md:text-base">{props.content}</p>
  </div>
);

const ProfileView: Component = () => {
  onMount(() => me.refetch());

  return (
    <>
      <header class="pt-[env(safe-area-inset-top)]">
        <nav class="flex items-center justify-end px-8 h-[72px]">
          <a href="/settings" aria-label="Settings">
            <MdiCog class="text-xl" />
          </a>
        </nav>
      </header>

      <main class="pb-32 px-8 space-y-8 mb-[env(safe-area-inset-bottom)]">
        <Show when={me.get()} fallback={<p class="text-center pt-8 animate-pulse">Loading your profile...</p>}>
          {me => (
            <>
              <div class="flex flex-col items-center text-center gap-4">
                <ProfilePicture
                  username={me().username}
                  media={me().profilePicture}
                  fullName={me().fullname}
                  size={168}
                  textSize={64}
                />

                <div class="flex flex-col">
                  <h1 class="text-2xl font-700 line-height-none">
                    {me().fullname}
                  </h1>
                  <p class="text-white/60">
                    {me().username}
                  </p>
                </div>

                <p>{me().biography}</p>
                <div class="flex items-center justify-center flex-wrap gap-2">
                  <Chip content={`${me().streakLength} days`} />
                  <Chip content={`${me().location} (${me().countryCode})`} />
                  <Chip content={new Date(me().birthdate).toLocaleDateString()} />
                  <Chip content={me().gender} />
                </div>
              </div>

              <div class="flex justify-center gap-2 md:gap-6">
                <For each={me().realmojis}>
                  {realmoji => (
                    <div class="relative flex-shrink-0">
                      <img
                        class="w-12 h-12 sm:(w-16 h-16) md:(w-20 h-20) rounded-xl border-2 border-white/25"
                        src={realmoji.media.url}
                        alt={realmoji.emoji}
                      />
                      <p class="text-xs sm:text-sm md:text-base absolute -bottom-2 -right-2 rounded-full p-1.5">
                        {realmoji.emoji}
                      </p>
                    </div>
                  )}
                </For>
              </div>

              <div>
                <p class="text-white/50 text-center text-xs md:text-sm">
                  Joined the {new Date(me().createdAt).toLocaleString()}
                </p>
              </div>
            </>
          )}
        </Show>
      </main>

      <BottomNavigation />
    </>
  )
};

export default ProfileView;
