import {createResource, Show, type Component } from "solid-js";
import MdiChevronLeft from '~icons/mdi/chevron-left'
import ProfilePicture from "~/components/profile-picture";
import BottomNavigation from "~/components/bottom-navigation";
import { useParams } from "@solidjs/router";
import { person_profile } from "~/api/requests/person/profile";
import { ApiMedia } from "~/api/types/media";

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
  }
};

async function fetchUserProfile(id: string): Promise<UserProfile> {
  const response = await person_profile(id);
  if (!response) {
    throw new Error('User profile not found.');
  }
  console.log(response)
  return response;
}



const ProfileView: Component = () => {
  const { id } = useParams();
  const [userProfile] = createResource(id, fetchUserProfile);

  return (
    <>
      <header class="pt-[env(safe-area-inset-top)]">
        <nav class="flex items-center justify-between px-4 h-[72px]">
          <a href="#" class="p-2.5 rounded-full ml-[-10px]" aria-label="Back" onclick="window.history.back();">
            <MdiChevronLeft class="text-2xl" />
          </a>
        </nav>
      </header>

      <main class="pb-32 px-8 space-y-8 mb-[env(safe-area-inset-bottom)]">
        <Show when={userProfile()} fallback={<p class="text-center pt-8 animate-pulse">Loading this user's profile...</p>}>
          {(profile) => (
            <>
              <div class="flex flex-col items-center text-center gap-4">
                <ProfilePicture
                  username={profile().username}
                  media={profile().profilePicture}
                  fullName={profile().fullname}
                  size={168}
                  textSize={64}
                />

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
                  <Chip content={`${profile().streakLength} days`} />
                  <Chip content={`${profile().location} `} />
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
            </>
          )}
        </Show>
      </main>

      <BottomNavigation />
    </>
  );
};

export default ProfileView;
