import { type FlowComponent, For } from "solid-js";
import { useLocation } from "@solidjs/router";
import BottomNavigation from "~/components/bottom-navigation";

const FriendsLayout: FlowComponent = (props) => {
  const location = useLocation();

  return (
    <>
      <main>
        <header class="z-20 fixed top-0 inset-x-0 bg-gradient-to-b from-#0D0E12 to-transparent pt-[env(safe-area-inset-top)]">
          <nav class="flex items-center gap-4 h-[72px] px-8" role="banner">
            <For
              each={[
                { label: "Connections", path: "/friends/connections" },
                { label: "Requests", path: "/friends/requests" },
              ]}
            >
              {(tab) => (
                <a
                  href={tab.path}
                  class="text-2xl transition-all"
                  classList={{
                    "text-white font-700": tab.path === location.pathname,
                    "text-white/50 font-500": tab.path !== location.pathname,
                  }}
                >
                  {tab.label}
                </a>
              )}
            </For>
          </nav>
        </header>

        <div class="pb-32 pt-20 px-4 mt-[env(safe-area-inset-top)] mb-[env(safe-area-inset-bottom)]">
          {props.children}
        </div>
      </main>

      <BottomNavigation />
    </>
  );
};

export default FriendsLayout;
