import { useLocation, useNavigate } from "@solidjs/router";
import { createEffect, createMemo, createSignal, on, onMount, Show, type FlowComponent } from "solid-js";
import toast from "solid-toast";
import { ProfileInexistentError } from "~/api/requests/person/me";
import PullableScreen from "~/components/pullable-screen";
import feed from "~/stores/feed";
import feedFof from "~/stores/feed-fof";
import me from "~/stores/me";
import moment from "~/stores/moment"
import MdiRefresh from "~icons/mdi/refresh";
import { promptForPermissions } from "~/utils/permissions";
import BottomNavigation from "~/components/bottom-navigation";
import { DropdownMenu } from "@kobalte/core/dropdown-menu";
import MdiChevronDown from '~icons/mdi/chevron-down'
import MdiCheck from '~icons/mdi/check'

const FeedLayout: FlowComponent = (props) => {
  const navigate = useNavigate();

  const view = createMemo(() => {
    const path = useLocation().pathname.split("/").pop();

    if (path === "friends") {
      return "friends";
    }

    return "friends-of-friends";
  });

  const [isRefreshing, setIsRefreshing] = createSignal(false);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);

      await me.refetch();
      await Promise.all([
        void async function () {
          await feed.refetch();

          if (view() === "friends-of-friends") {
            await feedFof.refetch();
          }
        }(),
        moment.refetch()
      ]);
    }
    catch (error) {
      if (error instanceof ProfileInexistentError) {
        navigate("/create-profile");
      }
      else {
        console.error("[FeedLayout::handleRefresh]:", error);

        if (error instanceof Error) {
          toast.error(error.message);
        }
        else {
          // Whatever the error is, we'll just show it as a string.
          toast.error("An unknown error occurred: " + String(error));
        }

      }
    }
    finally {
      setIsRefreshing(false);
    }
  };

  onMount(async () => {
    // Ask the user for notification permissions.
    await promptForPermissions();
  });

  createEffect(on(view, async () => {
    // Automatically refresh whenever the user navigates to the feed.
    await handleRefresh();
  }));

  return (
    <>
      <header class="pt-[env(safe-area-inset-top)]">
        <nav class="flex items-center justify-between gap-4 px-8 h-[72px]">
          {/* <a href="/friends/connections" aria-label="Relationships">
            <MdiPeople class="text-xl" />
          </a> */}

          {/* <p
            class="text-2xl text-center text-white font-700"
            role="banner"
          >
            Friends
          </p> */}

          <DropdownMenu preventScroll={false}>
            <DropdownMenu.Trigger class="flex items-center gap-2 text-2xl text-center font-700" style={{"color": "var(--text-primary)"}}>
              <span>{view() === "friends" ? "Friends" : "Friends of Friends"}</span>
              <DropdownMenu.Icon class="kobalte-expanded:rotate-180 transition-transform">
                <MdiChevronDown />
              </DropdownMenu.Icon>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content class="transform-origin-[var(--kb-menu-content-transform-origin)] mt-2 z-50 w-[240px] backdrop-blur-xl rounded-xl overflow-hidden shadow-2xl animate-[contentHide_200ms_ease-in_forwards] kobalte-expanded:animate-[contentShow_200ms_ease-out]" style={{"background-color": "var(--overlay)"}}>
                <DropdownMenu.Item class="px-4 py-2 cursor-pointer transition-colors flex items-center justify-between" style={{"color": "var(--text-primary)"}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--overlay-strong)"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  onSelect={() => {
                    navigate("/feed/friends");
                  }}
                >
                  Friends
                  <Show when={view() === "friends"}>
                    <MdiCheck />
                  </Show>
                </DropdownMenu.Item>
                <DropdownMenu.Item class="px-4 py-2 border-t cursor-pointer transition-colors flex items-center justify-between" style={{"color": "var(--text-primary)", "border-color": "var(--border-primary)"}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--overlay-strong)"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  onSelect={() => {
                    navigate("/feed/friends-of-friends");
                  }}
                >
                  Friends of Friends
                  <Show when={view() === "friends-of-friends"}>
                    <MdiCheck />
                  </Show>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing()}
            title="Refresh feed & last moment"
          >
            <MdiRefresh
              class="text-2xl rounded-full p-1"
              style={{
                "color": isRefreshing() ? "var(--text-secondary)" : "var(--text-primary)",
                "background-color": isRefreshing() ? "var(--overlay)" : "transparent"
              }}
              classList={{
                "animate-spin": isRefreshing(),
              }}
            />
          </button>
        </nav>
      </header>

      <div class="pt-4 pb-32 mb-[env(safe-area-inset-bottom)]">
        <PullableScreen onRefresh={handleRefresh}>
          <main>
            {props.children}
          </main>
        </PullableScreen>
      </div>

      <BottomNavigation />
    </>
  )
};

export default FeedLayout;
