import { useLocation, useNavigate } from "@solidjs/router";
import { createSignal, onMount, type FlowComponent } from "solid-js";
import toast from "solid-toast";
import { ProfileInexistentError } from "~/api/requests/person/me";
import ProfilePicture from "~/components/profile-picture";
import PullableScreen from "~/components/pullable-screen";
import feed from "~/stores/feed";
import me from "~/stores/me";
import moment from "~/stores/moment"
import MdiRefresh from "~icons/mdi/refresh";
import MdiPeople from "~icons/mdi/people";

const FeedLayout: FlowComponent = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isRefreshing, setIsRefreshing] = createSignal(false);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);

      await me.refetch();
      await Promise.all([feed.refetch(), moment.refetch()]);
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

  // Automatically refresh whenever the user navigates to the feed.
  onMount(() => handleRefresh());

  return (
    <div>
      <header class="z-20 fixed top-0 inset-x-0 bg-gradient-to-b from-black to-transparent pt-[env(safe-area-inset-top)]">
        <nav class="flex items-center justify-between px-4 h-[72px]">
          <a href="/friends/connections" aria-label="Relationships">
            <MdiPeople class="text-xl" />
          </a>

          <p
            class="absolute inset-x-0 w-fit mx-auto text-2xl text-center text-white font-700"
            role="banner"
          >
            StayReal.
          </p>

          <div class="flex gap-4 items-center">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing()}
              title="Refresh feed & last moment"
            >
              <MdiRefresh
                class="text-white text-2xl rounded-full p-1"
                classList={{
                  "animate-spin text-white/50 bg-white/10": isRefreshing(),
                }}
              />
            </button>

            <a href="/profile" aria-label="My profile" class="flex-shrink">
              <ProfilePicture
                media={me.get()?.profilePicture}
                username={me.get()?.username || ""}
                size={32}
                textSize={12}
              />
            </a>
          </div>
        </nav>
      </header>

      <div class="py-16 mt-[env(safe-area-inset-top)] mb-[env(safe-area-inset-bottom)]">
        <PullableScreen onRefresh={handleRefresh}
          shouldPullToRefresh={true} // TODO
        >
          <main>
            {props.children}
          </main>
        </PullableScreen>
      </div>
    </div>
  )
};

export default FeedLayout;
