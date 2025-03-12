import { Show, type Component } from "solid-js";
import me from "~/stores/me";
import MdiShareVariant from "~icons/mdi/share-variant";

import { type } from "@tauri-apps/plugin-os";
import ProfilePicture from "../profile-picture";
const isAndroid = type() === "android";

/**
 * Invite friends to BeReal callout.
 */
const InviteCallout: Component = () => {
  return (
    <div class="mb-6 cursor-pointer focus:scale-[0.98] active:scale-95 transition-transform">
      <div class="relative bg-[#121212] rounded-2xl p-3.5 overflow-hidden">
        <Show when={!isAndroid && me.get()!.profilePicture}>
          {(profilePicture) => (
            <div
              class="absolute inset-0 opacity-30 scale-120 blur-xl bg-cover bg-center"
              style={{ "background-image": `url(${profilePicture().url})` }}
            />
          )}
        </Show>

        <div
          class="relative flex items-center justify-between cursor-pointer"
          onClick={async () => {
            const shareUrl = `https://bere.al/${me.get()!.username}`;
            await navigator.clipboard.writeText(shareUrl);

            await navigator.share({
              title: "Join me on BeReal.",
              text: "Add me on BeReal.!",
              url: shareUrl,
            }).catch(() => void 0);
          }}
        >
          <div class="flex items-center gap-4">
            <ProfilePicture
              fullName={me.get()!.fullname}
              username={me.get()!.username}
              media={me.get()!.profilePicture}
              size={44}
              textSize={16}
            />

            <div class="flex flex-col gap-0.5">
              <p class="text-white font-500 text-[15px]">
                Invite friends
              </p>
              <p class="text-sm text-white/50">
                bere.al/{me.get()!.username}
              </p>
            </div>
          </div>
          <MdiShareVariant class="text-[22px] text-white" />
        </div>
      </div>
    </div>
  )
}

export default InviteCallout;
