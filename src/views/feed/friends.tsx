import { createSignal, For, Show, type Component } from "solid-js";
import FeedFriendsOverview from "~/components/feed/friends/overview";
import feed from "~/stores/feed";
import FeedUserOverview from "~/components/feed/user/overview";
import MdiCamera from '~icons/mdi/camera'
import moment from "~/stores/moment";

const FeedFriendsView: Component = () => {
  const [isScrolling, setIsScrolling] = createSignal(false);

  return (
    <Show
      when={feed.get()}
      fallback={
        <p class="text-center text-white/50">finding your feed...</p>
      }
    >
      {(feed) => (
        <>
          <Show
            when={feed().userPosts}
            fallback={
              <div class="text-center flex flex-col gap-1 px-4 mx-4 bg-white/10 py-4 rounded-2xl">
                <p class="mb-4">
                  You haven't posted anything today.
                </p>

                <a
                  href="/upload"
                  class="flex items-center justify-center gap-2 block text-center py-3 font-600 bg-white text-black rounded-2xl"
                >
                  <MdiCamera /> StayReal.
                </a>

                <Show when={moment.get()}>
                  {(moment) => (
                    <p class="text-white/50 mt-1 text-xs">
                      Last moment was at{" "}
                      {new Date(
                        moment().startDate
                      ).toLocaleTimeString()}
                    </p>
                  )}
                </Show>
              </div>
            }
          >
            {(overview) => (
              <FeedUserOverview
                overview={overview()}
                setScrolling={setIsScrolling}
              />
            )}
          </Show>

          <div class="flex flex-col gap-6 mt-8">
            <For
              each={[...feed().friendsPosts].sort(
                (a, b) =>
                  new Date(
                    b.posts[b.posts.length - 1].postedAt
                  ).getTime() -
                  new Date(
                    a.posts[a.posts.length - 1].postedAt
                  ).getTime()
              )}
            >
              {(overview) => (
                <FeedFriendsOverview
                  overview={overview}
                  setScrolling={setIsScrolling}
                />
              )}
            </For>
          </div>

          <section class="pt-16 px-8">
            <p class="text-center text-white/50">
              You're at the end of your feed, come back later !
            </p>
          </section>
        </>
      )}
    </Show>
  );
};

export default FeedFriendsView;
