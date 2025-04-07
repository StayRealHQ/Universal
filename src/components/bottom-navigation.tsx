import { Show, type Component, type JSX } from "solid-js";

import MingcuteSunFill from '~icons/mingcute/sun-fill'
import MingcuteSunLine from '~icons/mingcute/sun-line'

import MingcuteCamera2Fill from '~icons/mingcute/camera-2-fill'

import MingcuteGroup2Fill from '~icons/mingcute/group-2-fill'
import MingcuteGroup2Line from '~icons/mingcute/group-2-line'
import MingcuteUploadLine from '~icons/mingcute/upload-line'

import MingcuteGroup3Fill from '~icons/mingcute/group-3-fill'
import MingcuteGroup3Line from '~icons/mingcute/group-3-line'
import ProfilePicture from "./profile-picture";
import me from "~/stores/me";
import toast from "solid-toast";
import { useLocation } from "@solidjs/router";
import { isSmallerThan386px } from "~/utils/responsive";

const BottomNavigation: Component = () => {
  const location = useLocation();

  const Entry: Component<{
    outlineIcon: JSX.Element
    filledIcon: JSX.Element
    selected?: boolean
    label: string
    href: string
  }> = (props) => (
    <a href={props.href} onClick={() => {
      if (props.label === "Messages") {
        toast("Messages are not available yet.");
      }
    }} class="grow flex flex-col text-white justify-center items-center gap-1"
      classList={{
        "opacity-50": !props.selected
      }}
    >
      <div class="text-xl text-shadow-xl">
        <Show when={props.selected} fallback={props.outlineIcon}>
          {props.filledIcon}
        </Show>
      </div>

      <p class="text-sm text-shadow-xl"
        classList={{
          "hidden": isSmallerThan386px()
        }}
      >
        {props.label}
      </p>
    </a>
  )

  return (
    <nav class="z-50 fixed bottom-0 inset-x-0 bg-gradient-to-t from-#0D0E12/90 from-4% to-#0D0E12/0 pb-[env(safe-area-inset-bottom)] flex items-center">
      <div class="my-auto flex items-center gap-4 px-8 grow py-6">
        <Entry href="/feed/friends"
          filledIcon={<MingcuteSunFill />}
          outlineIcon={<MingcuteSunLine />}
          label="Today"
          selected={location.pathname.startsWith("/feed")}
        />
        <Entry href="/friends/connections"
          filledIcon={<MingcuteGroup2Fill />}
          outlineIcon={<MingcuteGroup2Line />}
          label="Friends"
          selected={location.pathname.startsWith("/friends")}
        />

        <a href="/upload" class="text-black bg-white rounded-full py-2 px-4 flex">
          <MingcuteCamera2Fill class="text-2xl "/>
        </a>

        <a href="/uploadFromStorage" class="text-black bg-white rounded-full py-2 px-4 flex">
          <MingcuteUploadLine class="text-2xl "/>
        </a>

        <Entry href="#"
          filledIcon={<MingcuteGroup3Fill />}
          outlineIcon={<MingcuteGroup3Line />}
          label="Messages"
          selected={location.pathname.startsWith("/messages")}
        />

        <a href="/profile" aria-label="My profile" class="shrink-0 grow flex flex-col text-white justify-center items-center gap-1"
          classList={{
            "opacity-50": location.pathname !== "/profile"
          }}
        >
          <ProfilePicture
            media={me.get()?.profilePicture}
            username={me.get()?.username || ""}
            fullName={me.get()?.fullname || ""}
            size={24}
            textSize={10}
          />

          <p class="text-sm text-shadow-xl"
            classList={{
              "hidden": isSmallerThan386px()
            }}
          >
            Profile
          </p>
        </a>

      </div>
    </nav>
  )
}

export default BottomNavigation;
