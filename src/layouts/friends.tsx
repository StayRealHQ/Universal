import { type FlowComponent, For } from "solid-js";
import MdiChevronRight from "~icons/mdi/chevron-right";
import { useLocation } from "@solidjs/router";

const FriendsLayout: FlowComponent = (props) => {
  const location = useLocation();

  return (
    <main>
      <header class="z-20 fixed top-0 inset-x-0 bg-gradient-to-b from-black to-transparent pt-[env(safe-area-inset-top)]">
        <nav class="flex items-center justify-between px-4 h-[72px]">
          <div class="w-8" />

          <p
            class="absolute inset-x-0 w-fit mx-auto text-2xl text-center text-white font-700"
            role="banner"
          >
            StayReal.
          </p>

          <a href="/feed/friends" aria-label="Return Feed">
            <MdiChevronRight class="text-xl" />
          </a>
        </nav>
      </header>

      <div class="pb-32 pt-20 mt-[env(safe-area-inset-top)] mb-[env(safe-area-inset-bottom)]">
        <div class="fixed bottom-8 left-4 right-4 z-50">
          <div
            class="backdrop-blur-sm backdrop-brightness-50 bg-[#1a1a1a]/80 rounded-full py-1 px-1.5 flex items-center justify-between shadow-lg shadow-black/20"
          >
            <For
              each={[
                // { label: "Suggestions", path: "/friends/suggestions" },
                { label: "Connections", path: "/friends/connections" },
                { label: "Requests", path: "/friends/requests" },
              ]}
            >
              {(tab) => (
                <a
                  href={tab.path}
                  class="flex-1 px-4 py-2 rounded-full text-center text-[14px] font-semibold transition-colors"
                  classList={{
                    "bg-[#2a2a2a] !py-1.5 text-white": tab.path === location.pathname,
                    "text-white/80": tab.path !== location.pathname,
                  }}
                >
                  {tab.label}
                </a>
              )}
            </For>
          </div>
        </div>

        {props.children}
      </div>
    </main>
  );
};

export default FriendsLayout;
