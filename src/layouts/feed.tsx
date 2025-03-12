import { useLocation, useNavigate } from "@solidjs/router";
import { createSignal, onMount, type FlowComponent } from "solid-js";
import toast from "solid-toast";
import { ProfileInexistentError } from "~/api/requests/person/me";
import PullableScreen from "~/components/pullable-screen";
import feed from "~/stores/feed";
import me from "~/stores/me";
import moment from "~/stores/moment"
import MdiRefresh from "~icons/mdi/refresh";
import { promptForPermissions } from "~/utils/permissions";
import BottomNavigation from "~/components/bottom-navigation";

const FeedLayout: FlowComponent = (props) => {
  const navigate = useNavigate();
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

  onMount(async () => {
    // Ask the user for notification permissions.
    await promptForPermissions();

    // Automatically refresh whenever the user navigates to the feed.
    await handleRefresh();
  });

  return (
    <>
      <header class="pt-[env(safe-area-inset-top)]">
        <nav class="flex items-center gap-4 px-8 h-[72px]">
          {/* <a href="/friends/connections" aria-label="Relationships">
            <MdiPeople class="text-xl" />
          </a> */}

          <p
            class="text-2xl text-center text-white font-700"
            role="banner"
          >
            Friends
          </p>

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
