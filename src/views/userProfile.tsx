import { createSignal, createResource, For, Show, type Component } from "solid-js";
import MdiChevronLeft from '~icons/mdi/chevron-left'
import ProfilePicture from "~/components/profile-picture";
import BottomNavigation from "~/components/bottom-navigation";
import { useParams } from "@solidjs/router";
import { person_profile } from "~/api/requests/person/profile";
import { ApiMedia } from "~/api/types/media";
import { open } from "@tauri-apps/plugin-shell"

const Chip: Component<{ content: string }> = (props) => (
  <div class="bg-white/15 rounded-full py-1.5 px-2.5">
    <p class="text-xs sm:text-sm md:text-base">{props.content}</p>
  </div>
);



type UserProfile = {
  fullname: string;
  username: string;
  isPrivate: boolean;
  biography: string;
  streakLength: number;
  location: string;
  createdAt: string;
  profilePicture: ApiMedia | null;
  relationship: {
    friendedAt: string;
    commonFriends: {
      sample: {
        id: string;
        fullname: string;
        username: string;
        profilePicture: ApiMedia | null;
      }[];
    };
  }
};

async function fetchUserProfile(id: string): Promise<UserProfile> {
  const response = await person_profile(id);
  if (!response) {
    throw new Error('User profile not found.');
  }
  return response;
}



const ProfileView: Component = () => {
  const { id: initialId } = useParams();
  const [profileId, setProfileId] = createSignal(initialId);
  const [userProfile] = createResource(profileId, fetchUserProfile);


  return (
    <>
      <header class="pt-[env(safe-area-inset-top)]">
        <nav class="flex items-center justify-between px-4 h-[72px]">
          <a href="#" class="p-2.5 rounded-full ml-[-10px]" aria-label="Back" onClick={() => window.history.back()}>
            <MdiChevronLeft class="text-2xl" />
          </a>
        </nav>
      </header>

      <main class="pb-32 px-8 space-y-8 mb-[env(safe-area-inset-bottom)]">
        <Show when={userProfile()} fallback={<p class="text-center pt-8 animate-pulse">Loading this user's profile...</p>}>
          {(profile) => (
            <>
              <div class="flex flex-col items-center text-center gap-4">
                <div onClick={() => profile().profilePicture ? open(profile().profilePicture!.url) : void 0} class="relative w-[168px] h-[168px]">
                  <ProfilePicture
                    username={profile().username}
                    media={profile().profilePicture}
                    fullName={profile().fullname}
                    size={168}
                    textSize={64}
                  />
                </div>
                <div class="flex flex-col">
                  <h1 class="text-2xl font-700 line-height-none">
                    {profile().fullname}
                  </h1>
                  <p class="text-white/60">
                    {profile().username} ({profile().isPrivate ? "PRIVATE" : "PUBLIC"})
                  </p>
                </div>

                <div class="whitespace-pre-line">
                  {profile().biography}
                </div>
                <div class="flex items-center justify-center flex-wrap gap-2">
                  <Show when={profile().streakLength !== 0}>
                    <Chip content={`${profile().streakLength} days`} />
                  </Show>

                  <Show when={profile().location != null}>
                    <Chip content={profile().location!} />
                  </Show>
                </div>
              </div>

              <div>
                <p class="text-white/50 text-center text-xs md:text-sm">
                  Joined on {new Date(profile().createdAt).toLocaleString()}
                </p>
                <p class="text-white/50 text-center text-xs md:text-sm">
                  Became friends on {new Date(profile().relationship.friendedAt).toLocaleString()}
                </p>
              </div>


              <div>
                <h2 class="text-sm text-white/60 uppercase font-600 mb-4">
                  Mutual Friends ({profile().relationship.commonFriends.sample.length})
                </h2>

                <div class="flex flex-col gap-2">
                <For each={profile().relationship.commonFriends.sample}>
                    {(commonFriend) => (
                      <button
                        class="flex items-center gap-4 p-1.5 rounded-lg focus:scale-[0.98] active:scale-95 transition-transform"
                        onClick={() => setProfileId(commonFriend.id)}
                      >
                        <ProfilePicture
                          fullName={commonFriend.fullname}
                          username={commonFriend.username}
                          media={commonFriend.profilePicture}
                          size={50}
                        />

                        <div class="flex flex-col items-start">
                          <p class="font-400">{commonFriend.fullname}</p>
                          <p class="text-sm text-white/40">@{commonFriend.username}</p>
                        </div>
                      </button>
                    )}
                  </For>
                </div>
              </div>
            </>
          )}
        </Show>
      </main>

      <BottomNavigation />
    </>
  );
};

export default ProfileView;
