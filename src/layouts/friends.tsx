import { type FlowComponent, For } from "solid-js";
import { useLocation } from "@solidjs/router";
import BottomNavigation from "~/components/bottom-navigation";

const FriendsLayout: FlowComponent = (props) => {
  const location = useLocation();

  return (
    <>
      <main>
        <header class="z-20 fixed top-0 inset-x-0 pt-[env(safe-area-inset-top)]" style={{"background": "linear-gradient(to bottom, var(--bg-primary), transparent)"}}>
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
                  style={{
                    "color": tab.path === location.pathname ? "var(--text-primary)" : "var(--text-secondary)",
                    "font-weight": tab.path === location.pathname ? "700" : "500"
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
