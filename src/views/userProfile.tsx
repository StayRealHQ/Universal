import { createSignal, onMount, Show, type Component } from "solid-js";
import MdiCog from '~icons/mdi/cog';
import ProfilePicture from "~/components/profile-picture";
import BottomNavigation from "~/components/bottom-navigation";
import { useParams } from "@solidjs/router";
import { person_profile, PersonNotFoundError } from "~/api/requests/person/profile";

const Chip: Component<{ content: string }> = (props) => (
  <div class="bg-white/15 rounded-full py-1.5 px-2.5">
    <p class="text-xs sm:text-sm md:text-base">{props.content}</p>
  </div>
);

const ProfileView: Component = () => {
  const { id } = useParams();
  const [userProfile, setUserProfile] = createSignal<any>(null);

  onMount(async () => {
    try {
      const profile = await person_profile(id);
      console.log("Profile:", profile);

      setUserProfile({
        fullname: profile.fullname,
        username: profile.username,
        isPrivate: profile.isPrivate,
        biography: profile.biography,
        streakLength: profile.streakLength,
        location: profile.location,
        countryCode: null,
        birthdate: null,
        gender: null,
        createdAt: profile.createdAt,
        profilePicture: profile.profilePicture,
      });
    } catch (error) {
      if (error instanceof PersonNotFoundError) {
        console.error("Person not found.");
      } else {
        console.error("Error fetching profile:", error);
      }
    }
  });

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
        <Show when={userProfile()} fallback={<p class="text-center pt-8 animate-pulse">Loading your profile...</p>}>
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
